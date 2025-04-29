import { Pool } from 'pg';
import { logger } from '../utils/logger';
import {
  IRoute,
  IRouteType,
  ICreateRouteRequest,
  IUpdateRouteRequest,
} from './types/IRoute';
import { createTrackFromPolygon } from './createTrack';
import { IPolygon } from './types';
import {
  IRoutePoint,
  IRouteSegment,
  IRouteProgress,
} from './types/IRouteOptimizer';
import { RouteOptimizer } from './RouteOptimizer';
import { Redis } from 'ioredis';

export interface IPlace {
  id: number;
  name: string;
  description?: string;
  type_id: number;
  type_name: string;
  opening_hours?: string;
  coordinates?: {
    longitude: number;
    latitude: number;
  };
}

export class RouteService {
  private pool: Pool;
  private routeOptimizer: RouteOptimizer;

  constructor(pool: Pool) {
    this.pool = pool;
    this.routeOptimizer = new RouteOptimizer(
      new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      }),
      process.env.OSRM_URL || 'https://router.project-osrm.org'
    );
  }

  async getRouteTypes(): Promise<IRouteType[]> {
    try {
      const result = await this.pool.query(
        'SELECT * FROM route_types ORDER BY name'
      );
      return result.rows;
    } catch (error) {
      logger.error('Ошибка при получении типов маршрутов:', error);
      throw error;
    }
  }

  async getRoutes(): Promise<IRoute[]> {
    try {
      const routesResult = await this.pool.query(`
                SELECT r.*, rt.name as type_name
                FROM routes r
                LEFT JOIN route_types rt ON r.type_id = rt.id
                ORDER BY r.created_at DESC
            `);

      const routes = routesResult.rows;

      // Получаем точки для каждого маршрута
      for (const route of routes) {
        const pointsResult = await this.pool.query(
          `
                SELECT 
                    rp.*,
                    p.name as place_name,
                    p.description as place_description,
                    p.type_id as place_type_id,
                    p.opening_hours as place_opening_hours,
                    ST_X(p.coordinates::geometry) as latitude,
                    ST_Y(p.coordinates::geometry) as longitude,
                    pt.name as place_type_name
                FROM route_points rp
                LEFT JOIN places p ON rp.place_id = p.id
                LEFT JOIN place_types pt ON p.type_id = pt.id
                WHERE rp.route_id = $1
                ORDER BY rp.order_index
            `,
          [route.id]
        );

        route.points = pointsResult.rows.map((point) => ({
          ...point,
          place: point.place_id
            ? {
                id: point.place_id,
                name: point.place_name,
                description: point.place_description,
                type_id: point.place_type_id,
                type_name: point.place_type_name,
                opening_hours: point.place_opening_hours,
                coordinates:
                  point.longitude && point.latitude
                    ? { longitude: point.longitude, latitude: point.latitude }
                    : undefined,
              }
            : undefined,
        }));
      }

      return routes;
    } catch (error) {
      logger.error('Ошибка при получении маршрутов:', error);
      throw error;
    }
  }

  async getRouteById(id: number): Promise<IRoute | null> {
    try {
      const routeResult = await this.pool.query(
        `
                SELECT r.*, rt.name as type_name
                FROM routes r
                LEFT JOIN route_types rt ON r.type_id = rt.id
                WHERE r.id = $1
            `,
        [id]
      );

      if (routeResult.rows.length === 0) {
        return null;
      }

      const pointsResult = await this.pool.query(
        `
                SELECT 
                    rp.*,
                    p.name as place_name,
                    p.description as place_description,
                    p.type_id as place_type_id,
                    p.opening_hours as place_opening_hours,
                    ST_X(p.coordinates::geometry) as latitude,
                    ST_Y(p.coordinates::geometry) as longitude,
                    pt.name as place_type_name
                FROM route_points rp
                LEFT JOIN places p ON rp.place_id = p.id
                LEFT JOIN place_types pt ON p.type_id = pt.id
                WHERE rp.route_id = $1
                ORDER BY rp.order_index
            `,
        [id]
      );

      return {
        ...routeResult.rows[0],
        points: pointsResult.rows.map((point) => ({
          ...point,
          place: point.place_id
            ? {
                id: point.place_id,
                name: point.place_name,
                description: point.place_description,
                type_id: point.place_type_id,
                type_name: point.place_type_name,
                opening_hours: point.place_opening_hours,
                coordinates:
                  point.longitude && point.latitude
                    ? { longitude: point.longitude, latitude: point.latitude }
                    : undefined,
              }
            : undefined,
        })),
      };
    } catch (error) {
      logger.error(`Ошибка при получении маршрута ${id}:`, error);
      throw error;
    }
  }

  async createRoute(route: ICreateRouteRequest): Promise<IRoute> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Создаем маршрут
      const routeResult = await client.query(
        `
                INSERT INTO routes (name, description, type_id)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
        [route.name, route.description, route.type_id]
      );

      const newRoute = routeResult.rows[0];

      // Добавляем точки маршрута
      for (const point of route.points) {
        await client.query(
          `
                    INSERT INTO route_points (route_id, place_id, order_index, description, visit_time)
                    VALUES ($1, $2, $3, $4, $5)
                `,
          [
            newRoute.id,
            point.place_id,
            point.order_index,
            point.description,
            point.visit_time,
          ]
        );
      }

      await client.query('COMMIT');
      return this.getRouteById(newRoute.id) as Promise<IRoute>;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Ошибка при создании маршрута:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateRoute(
    id: number,
    route: IUpdateRouteRequest
  ): Promise<IRoute | null> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Обновляем маршрут
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      if (route.name) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(route.name);
        paramIndex++;
      }

      if (route.description) {
        updateFields.push(`description = $${paramIndex}`);
        values.push(route.description);
        paramIndex++;
      }

      if (route.type_id) {
        updateFields.push(`type_id = $${paramIndex}`);
        values.push(route.type_id);
        paramIndex++;
      }

      if (updateFields.length > 0) {
        values.push(id);
        await client.query(
          `
                    UPDATE routes
                    SET ${updateFields.join(', ')}
                    WHERE id = $${paramIndex}
                `,
          values
        );
      }

      // Обновляем точки маршрута, если они предоставлены
      if (route.points) {
        // Удаляем старые точки
        await client.query('DELETE FROM route_points WHERE route_id = $1', [
          id,
        ]);

        // Добавляем новые точки
        for (const point of route.points) {
          await client.query(
            `
                        INSERT INTO route_points (route_id, place_id, order_index, description, visit_time)
                        VALUES ($1, $2, $3, $4, $5)
                    `,
            [
              id,
              point.place_id,
              point.order_index,
              point.description,
              point.visit_time,
            ]
          );
        }
      }

      await client.query('COMMIT');
      return this.getRouteById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Ошибка при обновлении маршрута ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteRoute(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query('DELETE FROM routes WHERE id = $1', [
        id,
      ]);
      return result.rowCount > 0;
    } catch (error) {
      logger.error(`Ошибка при удалении маршрута ${id}:`, error);
      throw error;
    }
  }

  async createRouteFromPolygon(
    polygon: IPolygon,
    name: string,
    type_id: number
  ): Promise<IRoute> {
    try {
      // Создаем трек из полигона
      const track = createTrackFromPolygon(polygon);

      // Преобразуем точки трека в формат для создания маршрута
      const routePoints = track.points.map((point, index) => ({
        place_id: 0, // TODO: Нужно добавить логику сопоставления точек с местами
        order_index: index,
        description: point.title,
      }));

      // Создаем маршрут
      const routeData: ICreateRouteRequest = {
        name,
        type_id,
        points: routePoints,
      };

      return this.createRoute(routeData);
    } catch (error) {
      logger.error('Ошибка при создании маршрута из полигона:', error);
      throw error;
    }
  }

  async getPlaceById(id: number): Promise<IPlace | null> {
    try {
      const result = await this.pool.query(
        `
                SELECT 
                    p.*,
                    pt.name as type_name,
                    ST_X(p.coordinates::geometry) as latitude,
                    ST_Y(p.coordinates::geometry) as longitude
                FROM places p
                LEFT JOIN place_types pt ON p.type_id = pt.id
                WHERE p.id = $1
            `,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const place = result.rows[0];
      return {
        id: place.id,
        name: place.name,
        description: place.description,
        type_id: place.type_id,
        type_name: place.type_name,
        opening_hours: place.opening_hours,
        coordinates:
          place.longitude && place.latitude
            ? { longitude: place.longitude, latitude: place.latitude }
            : undefined,
      };
    } catch (error) {
      logger.error(`Ошибка при получении места ${id}:`, error);
      throw error;
    }
  }

  async getOptimizedRoute(routeId: number): Promise<IRouteSegment[]> {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) {
        throw new Error(`Route with id ${routeId} not found`);
      }

      // Преобразуем точки маршрута в формат для RouteOptimizer
      const routePoints: IRoutePoint[] = route.points.map((point, index) => ({
        latitude: point.place?.coordinates?.latitude || 0,
        longitude: point.place?.coordinates?.longitude || 0,
        order: index,
        isMainPoint: true,
        name: point.place?.name,
        description: point.description,
      }));

      // Получаем оптимизированный маршрут
      return this.routeOptimizer.calculateRoute(routePoints);
    } catch (error) {
      logger.error(`Error getting optimized route ${routeId}:`, error);
      throw error;
    }
  }

  async updateRouteProgress(
    currentLocation: { latitude: number; longitude: number },
    segments: IRouteSegment[]
  ): Promise<IRouteProgress> {
    try {
      return this.routeOptimizer.updateRouteProgress(currentLocation, segments);
    } catch (error) {
      logger.error('Error updating route progress:', error);
      throw error;
    }
  }

  async recalculateRoute(
    routeId: number,
    currentLocation: { latitude: number; longitude: number }
  ): Promise<IRouteSegment[]> {
    try {
      const route = await this.getRouteById(routeId);
      if (!route) {
        throw new Error(`Route with id ${routeId} not found`);
      }

      // Находим текущую точку маршрута
      const currentPointIndex = route.points.findIndex((point) => {
        if (!point.place?.coordinates) return false;
        const distance = this.calculateDistance(currentLocation, {
          latitude: point.place.coordinates.latitude,
          longitude: point.place.coordinates.longitude,
        });
        return distance < 100; // 100 метров - порог для определения текущей точки
      });

      if (currentPointIndex === -1) {
        throw new Error('Current location is not near any route point');
      }

      // Получаем оставшиеся точки маршрута
      const remainingPoints: IRoutePoint[] = route.points
        .slice(currentPointIndex)
        .map((point, index) => ({
          latitude: point.place?.coordinates?.latitude || 0,
          longitude: point.place?.coordinates?.longitude || 0,
          order: index,
          isMainPoint: true,
          name: point.place?.name,
          description: point.description,
        }));

      // Пересчитываем маршрут
      return this.routeOptimizer.recalculateRoute(
        currentLocation,
        remainingPoints
      );
    } catch (error) {
      logger.error(`Error recalculating route ${routeId}:`, error);
      throw error;
    }
  }

  private calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
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
}
