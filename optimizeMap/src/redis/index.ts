import { createClient } from 'redis';
import { logger } from '../utils/logger';
import { PlacesService } from './places';

let redisClient: ReturnType<typeof createClient> | null = null;
let placesService: PlacesService | null = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await redisClient.connect();
    logger.info('Connected to Redis');

    placesService = new PlacesService(redisClient);
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getPlacesByBbox = async (bbox: {
  leftBottomX: number;
  leftBottomY: number;
  rightTopX: number;
  rightTopY: number;
}) => {
  if (!redisClient) {
    throw new Error('Redis client is not connected');
  }

  try {
    const places = await redisClient.get('places');
    if (!places) {
      return [];
    }

    const parsedPlaces = JSON.parse(places);
    return parsedPlaces.filter((place: any) => {
      const { latitude, longitude } = place.coordinates;
      return (
        latitude >= bbox.leftBottomY &&
        latitude <= bbox.rightTopY &&
        longitude >= bbox.leftBottomX &&
        longitude <= bbox.rightTopX
      );
    });
  } catch (error) {
    logger.error('Error getting places from Redis:', error);
    return [];
  }
};

export function getRedisClient(): ReturnType<typeof createClient> {
  if (!redisClient) {
    throw new Error('Redis не инициализирован');
  }
  return redisClient;
}

export function getPlacesService(): PlacesService {
  if (!placesService) {
    throw new Error('PlacesService не инициализирован');
  }
  return placesService;
}
