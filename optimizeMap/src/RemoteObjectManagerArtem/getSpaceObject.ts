import { IRectangleСorners } from './mockData/types/IRectangleСorners';
import { ISpace } from './mockData/types/ISpace';
import { logger } from '../utils/logger';

/**
 * Преобразует объекты космических аппаратов в формат координат
 * @param spaceObject - массив объектов космических аппаратов
 * @returns массив координат в формате {x, y}
 */
export const parseCoordinates = (
  spaceObject: ISpace[] = []
): Array<{ x: number; y: number }> => {
  if (!spaceObject || spaceObject.length <= 0) {
    return [];
  }

  return spaceObject
    .filter((item) => item.geo && item.geo.longitude && item.geo.latitude)
    .map((item) => {
      return { x: item.geo.longitude, y: item.geo.latitude };
    });
};

/**
 * Получает объекты космических аппаратов, находящиеся в указанном прямоугольнике
 * @param rectangle - координаты прямоугольника
 * @param isCluster - флаг, указывающий возвращать ли объекты в формате координат для кластеризации
 * @param spaceData - входные данные космических аппаратов
 * @returns массив объектов или координат (зависит от параметра isCluster)
 */
export const getSpaceObject = async (
  { leftBottomX, leftBottomY, rightTopX, rightTopY }: IRectangleСorners,
  isCluster: boolean,
  spaceData: ISpace[]
): Promise<ISpace[] | Array<{ x: number; y: number }>> => {
  try {
    // Фильтрация данных по координатам
    const filteredData = spaceData.filter((item) => {
      if (!item.geo || !item.geo.longitude || !item.geo.latitude) {
        return false;
      }

      const { longitude, latitude } = item.geo;
      return (
        longitude >= leftBottomX &&
        longitude <= rightTopX &&
        latitude >= leftBottomY &&
        latitude <= rightTopY
      );
    });

    // Возвращаем либо координаты для кластера, либо сами объекты
    return isCluster ? parseCoordinates(filteredData) : filteredData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при получении космических объектов: ${errorMessage}`);
    return isCluster ? [] : [];
  }
};
