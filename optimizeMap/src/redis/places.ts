import { createClient, RedisClientType } from '@redis/client';
import { logger } from '../logger';

const redis = createClient({
  url: 'redis://geoindexservice-redis-1:6379',
}) as RedisClientType;

redis.on('error', (err) => logger.error('Redis Client Error', err));

export async function connectRedis() {
  try {
    await redis.connect();
    logger.info('Connected to Redis');
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    throw error;
  }
}

export interface Place {
  id: number;
  name: string;
  description: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  type: string;
}

export async function getPlacesByBbox(bbox: {
  leftBottomX: number;
  leftBottomY: number;
  rightTopX: number;
  rightTopY: number;
}): Promise<Place[]> {
  const placesService = new PlacesService(redis);
  return placesService.getPlacesByBbox(
    bbox.leftBottomX,
    bbox.leftBottomY,
    bbox.rightTopX,
    bbox.rightTopY
  );
}

export class PlacesService {
  private readonly redis: RedisClientType;
  private readonly GEO_KEY = 'places:geo';
  private readonly PLACE_KEY_PREFIX = 'place:';

  constructor(redis: RedisClientType) {
    this.redis = redis;
  }

  async getPlacesByBbox(
    leftBottomX: number,
    leftBottomY: number,
    rightTopX: number,
    rightTopY: number
  ): Promise<Place[]> {
    try {
      // Вычисляем центр области
      const centerLon = (leftBottomX + rightTopX) / 2;
      const centerLat = (leftBottomY + rightTopY) / 2;

      // Вычисляем размеры области в километрах
      const width = Math.abs(rightTopX - leftBottomX) * 111; // 111 км на градус по долготе
      const height = Math.abs(rightTopY - leftBottomY) * 111; // 111 км на градус по широте

      // Получаем ID объектов в заданной области
      const placeIds = (await this.redis.sendCommand([
        'GEOSEARCH',
        this.GEO_KEY,
        'FROMLONLAT',
        centerLon.toString(),
        centerLat.toString(),
        'BYBOX',
        width.toString(),
        height.toString(),
        'km',
      ])) as string[];

      if (!placeIds || placeIds.length === 0) {
        return [];
      }

      // Получаем детальную информацию о каждом объекте
      const places = await Promise.all(
        placeIds.map(async (id) => {
          const placeData = await this.redis.hGetAll(
            `${this.PLACE_KEY_PREFIX}${id}`
          );
          if (!placeData || Object.keys(placeData).length === 0) {
            return null;
          }
          return {
            id: Number(id),
            name: placeData.name,
            description: placeData.description,
            coordinates: {
              longitude: Number(placeData.longitude),
              latitude: Number(placeData.latitude),
            },
            type: placeData.type,
          };
        })
      );

      return places.filter((place): place is Place => place !== null);
    } catch (error) {
      logger.error('Ошибка при получении объектов из Redis', error);
      throw error;
    }
  }

  async getPlaceById(id: number): Promise<Place | null> {
    try {
      const placeData = await this.redis.hGetAll(
        `${this.PLACE_KEY_PREFIX}${id}`
      );

      if (!placeData || Object.keys(placeData).length === 0) {
        return null;
      }

      return {
        id,
        name: placeData.name,
        description: placeData.description,
        coordinates: {
          longitude: Number(placeData.longitude),
          latitude: Number(placeData.latitude),
        },
        type: placeData.type,
      };
    } catch (error) {
      logger.error(`Ошибка при получении объекта ${id} из Redis`, error);
      throw error;
    }
  }
}
