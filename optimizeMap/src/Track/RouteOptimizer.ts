import axios from 'axios';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';
import {
  IRoutePoint,
  IRouteSegment,
  IRouteProgress,
} from './types/IRouteOptimizer';

export class RouteOptimizer {
  private redis: Redis;
  private osrmUrl: string;

  constructor(redis: Redis, osrmUrl: string) {
    this.redis = redis;
    this.osrmUrl = osrmUrl || 'https://router.project-osrm.org';
  }

  async calculateRoute(points: IRoutePoint[]): Promise<IRouteSegment[]> {
    try {
      if (!points || points.length < 2) {
        throw new Error('At least 2 points are required for route calculation');
      }

      logger.info('Input points:', points);

      // Получаем маршрут от OSRM
      const coordinates = points
        .map((p) => `${p.longitude},${p.latitude}`)
        .join(';');

      logger.info('Requesting route from OSRM:', coordinates);

      const response = await axios.get(
        `${this.osrmUrl}/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
      );

      logger.info('OSRM response:', response.data);

      if (!response.data || !response.data.routes || !response.data.routes[0]) {
        throw new Error('Invalid response from OSRM');
      }

      const route = response.data.routes[0];
      if (!route.geometry || !route.geometry.coordinates) {
        throw new Error('No geometry in OSRM response');
      }

      // Преобразуем ответ OSRM в наши сегменты
      const segments: IRouteSegment[] = [];
      const geometry = route.geometry.coordinates;

      // Создаем массив точек маршрута
      const routePoints: IRoutePoint[] = geometry.map((coord, index) => ({
        latitude: coord[1],
        longitude: coord[0],
        isMainPoint: false,
        order: index,
      }));

      // Находим ближайшие точки к основным точкам из БД
      points.forEach((mainPoint) => {
        let minDistance = Infinity;
        let closestPointIndex = -1;

        routePoints.forEach((routePoint, index) => {
          const distance = this.calculateDistance(routePoint, mainPoint);
          if (distance < minDistance) {
            minDistance = distance;
            closestPointIndex = index;
          }
        });

        if (closestPointIndex !== -1) {
          routePoints[closestPointIndex].isMainPoint = true;
          routePoints[closestPointIndex].name = mainPoint.name;
          routePoints[closestPointIndex].description = mainPoint.description;
        }
      });

      // Разбиваем точки на сегменты
      let currentSegment: IRoutePoint[] = [];
      let lastMainPointIndex = -1;

      routePoints.forEach((point, index) => {
        currentSegment.push(point);

        if (point.isMainPoint && index > lastMainPointIndex) {
          segments.push({
            points: currentSegment,
            distance: this.calculateSegmentDistance(currentSegment),
            duration: this.calculateSegmentDuration(currentSegment),
            instructions: 'Двигайтесь по маршруту',
            street: 'Основная дорога',
          });
          currentSegment = [];
          lastMainPointIndex = index;
        }
      });

      // Добавляем последний сегмент, если он есть
      if (currentSegment.length > 0) {
        segments.push({
          points: currentSegment,
          distance: this.calculateSegmentDistance(currentSegment),
          duration: this.calculateSegmentDuration(currentSegment),
          instructions: 'Двигайтесь по маршруту',
          street: 'Основная дорога',
        });
      }

      if (segments.length === 0) {
        throw new Error('No segments generated from OSRM response');
      }

      logger.info('Generated segments:', segments);
      return segments;
    } catch (error) {
      logger.error('Error calculating route:', error);
      throw error;
    }
  }

  async updateRouteProgress(
    currentLocation: { latitude: number; longitude: number },
    segments: IRouteSegment[]
  ): Promise<IRouteProgress> {
    try {
      // Находим ближайший сегмент
      const nearestSegment = this.findNearestSegment(currentLocation, segments);

      // Вычисляем прогресс
      const progress = this.calculateProgress(segments, nearestSegment);

      // Получаем следующий основной пункт
      const nextMainPoint = this.findNextMainPoint(segments, nearestSegment);

      // Вычисляем общее расстояние и время
      const totalDistance = segments.reduce(
        (sum, segment) => sum + segment.distance,
        0
      );
      const totalDuration = segments.reduce(
        (sum, segment) => sum + segment.duration,
        0
      );

      // Вычисляем оставшееся расстояние и время
      const remainingDistance = this.calculateRemainingDistance(
        segments,
        nearestSegment
      );
      const remainingDuration = this.calculateEstimatedTime(
        segments,
        nearestSegment
      );

      return {
        totalDistance,
        remainingDistance,
        totalDuration,
        remainingDuration,
        progressPercentage: progress,
        nextMainPoint,
        distanceToNextPoint: this.calculateDistanceToNextPoint(
          currentLocation,
          nextMainPoint
        ),
        estimatedTimeToNextPoint: this.calculateEstimatedTimeToNextPoint(
          currentLocation,
          nextMainPoint
        ),
        currentSegment: nearestSegment,
      };
    } catch (error) {
      logger.error('Error updating route progress:', error);
      throw error;
    }
  }

  async recalculateRoute(
    currentLocation: { latitude: number; longitude: number },
    remainingPoints: IRoutePoint[]
  ): Promise<IRouteSegment[]> {
    return this.calculateRoute(remainingPoints);
  }

  private isNearPoint(
    coord1: number[],
    coord2: number[],
    threshold = 0.001
  ): boolean {
    const distance = Math.sqrt(
      Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2)
    );
    logger.info('Distance between points:', distance, 'Threshold:', threshold);
    return distance < threshold;
  }

  private calculateSegmentDistance(segment: IRoutePoint[]): number {
    let distance = 0;
    for (let i = 0; i < segment.length - 1; i++) {
      distance += this.calculateDistance(segment[i], segment[i + 1]);
    }
    return distance;
  }

  private calculateSegmentDuration(segment: IRoutePoint[]): number {
    // Предполагаем среднюю скорость 50 км/ч
    const speed = 50 / 3.6; // м/с
    return this.calculateSegmentDistance(segment) / speed;
  }

  private calculateDistance(point1: IRoutePoint, point2: IRoutePoint): number {
    const R = 6371e3; // радиус Земли в метрах
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private findNearestSegment(
    location: { latitude: number; longitude: number },
    segments: IRouteSegment[]
  ): IRouteSegment {
    let nearestSegment = segments[0];
    let minDistance = Infinity;

    for (const segment of segments) {
      for (const point of segment.points) {
        const distance = this.calculateDistance(
          {
            latitude: location.latitude,
            longitude: location.longitude,
            order: 0,
            isMainPoint: false,
          },
          point
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestSegment = segment;
        }
      }
    }

    return nearestSegment;
  }

  private calculateProgress(
    segments: IRouteSegment[],
    currentSegment: IRouteSegment
  ): number {
    const totalDistance = segments.reduce(
      (sum, segment) => sum + segment.distance,
      0
    );
    const passedDistance = segments.reduce((sum, segment) => {
      if (segment === currentSegment) {
        return sum + segment.distance / 2; // Предполагаем, что мы в середине текущего сегмента
      }
      if (segments.indexOf(segment) < segments.indexOf(currentSegment)) {
        return sum + segment.distance;
      }
      return sum;
    }, 0);

    return (passedDistance / totalDistance) * 100;
  }

  private findNextMainPoint(
    segments: IRouteSegment[],
    currentSegment: IRouteSegment
  ): IRoutePoint {
    const currentIndex = segments.indexOf(currentSegment);
    for (let i = currentIndex; i < segments.length; i++) {
      const mainPoint = segments[i].points.find((p) => p.isMainPoint);
      if (mainPoint) {
        return mainPoint;
      }
    }
    return segments[segments.length - 1].points[0];
  }

  private calculateRemainingDistance(
    segments: IRouteSegment[],
    currentSegment: IRouteSegment
  ): number {
    const currentIndex = segments.indexOf(currentSegment);
    return segments
      .slice(currentIndex)
      .reduce((sum, segment) => sum + segment.distance, 0);
  }

  private calculateEstimatedTime(
    segments: IRouteSegment[],
    currentSegment: IRouteSegment
  ): number {
    const currentIndex = segments.indexOf(currentSegment);
    return segments
      .slice(currentIndex)
      .reduce((sum, segment) => sum + segment.duration, 0);
  }

  private calculateDistanceToNextPoint(
    currentLocation: { latitude: number; longitude: number },
    nextPoint: IRoutePoint
  ): number {
    return this.calculateDistance(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        order: 0,
        isMainPoint: false,
      },
      nextPoint
    );
  }

  private calculateEstimatedTimeToNextPoint(
    currentLocation: { latitude: number; longitude: number },
    nextPoint: IRoutePoint
  ): number {
    const distance = this.calculateDistanceToNextPoint(
      currentLocation,
      nextPoint
    );
    const speed = 50 / 3.6; // м/с
    return distance / speed;
  }
}
