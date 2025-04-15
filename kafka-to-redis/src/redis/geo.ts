import { redisClient } from '../config';
import { logger } from '../config';

export async function addPlaceToGeoIndex(place: any) {
  try {
    const { id, name, coordinates } = place;

    // Проверяем формат координат
    if (
      !coordinates ||
      !coordinates.coordinates ||
      !Array.isArray(coordinates.coordinates)
    ) {
      throw new Error('Invalid coordinates format');
    }

    const [longitude, latitude] = coordinates.coordinates;

    // Add to Redis GEO index
    await redisClient.geoAdd('places:geo', {
      longitude,
      latitude,
      member: id.toString(),
    });

    // Store place details in Redis hash
    await redisClient.hSet(`place:${id}`, {
      id: id.toString(),
      name,
      longitude: longitude.toString(),
      latitude: latitude.toString(),
    });

    logger.info(`Added place ${id} to Redis geo index`);
  } catch (error) {
    logger.error('Error adding place to Redis geo index:', error);
    throw error;
  }
}

export async function searchPlacesByRadius(
  longitude: number,
  latitude: number,
  radius: number,
  unit: 'm' | 'km' | 'mi' | 'ft' = 'km'
) {
  try {
    const results = await redisClient.geoSearch(
      'places:geo',
      { longitude, latitude },
      { radius, unit }
    );

    if (results.length === 0) {
      return [];
    }

    // Get place details for each result
    const placeDetails = await Promise.all(
      results.map(async (placeId) => {
        const details = await redisClient.hGetAll(`place:${placeId}`);
        return {
          id: placeId,
          ...details,
        };
      })
    );

    return placeDetails;
  } catch (error) {
    logger.error('Error searching places by radius:', error);
    throw error;
  }
}
