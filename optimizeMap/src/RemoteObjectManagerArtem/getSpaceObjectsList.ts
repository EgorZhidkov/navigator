import { ISpace } from './mockData/types/ISpace';
import { mockSpace } from './mockData/mockSpace';
import { logger } from '../utils/logger';

interface ISpaceObjectResponse {
  id: number;
  system_id: string;
  title: string;
  info: string | null;
  photo: string[];
  geo: {
    longitude: number;
    latitude: number;
  };
}

/**
 * Преобразует данные космического объекта в нужный формат
 * @param spaceObject - объект космического объекта
 * @returns преобразованный объект в нужном формате
 */
const transformSpaceObject = (spaceObject: ISpace): ISpaceObjectResponse => {
  return {
    id: spaceObject.id,
    system_id: spaceObject.system_id,
    title: spaceObject.title,
    info: spaceObject.info || null,
    photo: spaceObject.photo,
    geo: {
      longitude: spaceObject.geo.longitude,
      latitude: spaceObject.geo.latitude,
    },
  };
};

/**
 * Получает список космических объектов в нужном формате
 * @returns массив космических объектов
 */
export const getSpaceObjectsList = (): { features: ISpaceObjectResponse[] } => {
  try {
    logger.info('Получение списка космических объектов');
    const transformedObjects = mockSpace.map(transformSpaceObject);
    logger.info(`Преобразовано ${transformedObjects.length} объектов`);
    return { features: transformedObjects };
  } catch (error) {
    logger.error('Ошибка при получении списка космических объектов', error);
    return { features: [] };
  }
};
