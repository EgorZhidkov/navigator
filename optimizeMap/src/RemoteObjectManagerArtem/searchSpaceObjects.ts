import { ISpace } from './mockData/types/ISpace';
import { mockSpace } from './mockData/mockSpace';
import { logger } from '../utils/logger';

interface ISpaceObjectResponse {
  id: number;
  system_id: string;
  title: string;
  info: string | null;
  photo?: string[];
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
 * Поиск космических объектов по названию
 * @param query - строка поиска
 * @returns массив найденных космических объектов
 */
export const searchSpaceObjects = (
  query: string
): { features: ISpaceObjectResponse[] } => {
  try {
    logger.info('Поиск космических объектов', { query });

    if (!query || query.trim().length === 0) {
      logger.info('Пустой поисковый запрос');
      return { features: [] };
    }

    // Приводим поисковый запрос к нижнему регистру для регистронезависимого поиска
    const searchQuery = query.toLowerCase().trim();

    // Фильтруем объекты по неполному совпадению названия
    const foundObjects = mockSpace.filter((spaceObject) =>
      spaceObject.title.toLowerCase().includes(searchQuery)
    );

    // Преобразуем найденные объекты в нужный формат
    const transformedObjects = foundObjects.map(transformSpaceObject);

    logger.info(
      `Найдено ${transformedObjects.length} объектов по запросу "${query}"`
    );
    return { features: transformedObjects };
  } catch (error) {
    logger.error('Ошибка при поиске космических объектов', error);
    return { features: [] };
  }
};
