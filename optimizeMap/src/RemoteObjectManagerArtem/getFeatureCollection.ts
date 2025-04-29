import { getSquarefromWindow } from './getSquareFromWindow';
import _ from 'lodash';
import { createCluster } from './createCluster';
import { createFeatures } from './createFeatures';
import { IRectangleСorners } from './mockData/types/IRectangleСorners';
import { ISpace } from './mockData/types/ISpace';
import { logger } from '../utils/logger';

/**
 * Интерфейс для коллекции объектов
 */
interface IFeatureCollection {
  type: string;
  features: any[];
}

/**
 * Разделяет изначальный квадрат на множество более мелких квадратов
 * @param square - изначальный квадрат
 * @param powOfTiles - степень разбиения (2^n квадратов)
 * @returns массив квадратов
 */
const cutTiles = (
  square: IRectangleСorners,
  powOfTiles: number
): IRectangleСorners[] => {
  let result: IRectangleСorners[] = [];
  let remainingPower = powOfTiles;

  while (remainingPower > 0) {
    if (result.length <= 0) {
      result = getSquarefromWindow(square);
    } else {
      result = _.flattenDeep(result.map((item) => getSquarefromWindow(item)));
    }
    remainingPower -= 1;
  }

  return result;
};

/**
 * Создает коллекцию объектов для отображения на карте
 * @param leftBottomX - X-координата левого нижнего угла
 * @param leftBottomY - Y-координата левого нижнего угла
 * @param rightTopX - X-координата правого верхнего угла
 * @param rightTopY - Y-координата правого верхнего угла
 * @param powOfTiles - степень разбиения квадрата
 * @param zoom - текущий уровень масштабирования
 * @param spaceData - исходные данные космических объектов
 * @returns коллекция объектов для отображения
 */
export const getFeatureCollection = async (
  leftBottomX: number,
  leftBottomY: number,
  rightTopX: number,
  rightTopY: number,
  powOfTiles: number,
  zoom: number,
  spaceData: ISpace[]
): Promise<IFeatureCollection | null> => {
  try {
    const viewportRect = { leftBottomX, leftBottomY, rightTopX, rightTopY };

    // Для больших увеличений отображаем объекты без кластеризации
    if (zoom >= 17) {
      const features = await createFeatures(viewportRect, zoom, spaceData);

      if (!features || features.length === 0) {
        logger.info('Не найдено объектов для отображения');
        return { type: 'FeatureCollection', features: [] };
      }

      return {
        type: 'FeatureCollection',
        features: features,
      };
    } else {
      // Для малых увеличений используем кластеризацию
      const tiles = cutTiles(viewportRect, powOfTiles);

      // Создаем кластеры для каждого тайла
      const clusterPromises = await Promise.all(
        tiles.map(async (square) => createCluster(square, zoom, spaceData))
      );

      // Фильтруем null-значения
      const validClusters = _.flattenDeep(clusterPromises).filter(
        (cluster) => cluster && cluster !== null
      );

      // Логируем результат
      logger.info(`Создано ${validClusters.length} кластеров или объектов`);

      return {
        type: 'FeatureCollection',
        features: validClusters,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при создании коллекции объектов: ${errorMessage}`);
    return { type: 'FeatureCollection', features: [] };
  }
};
