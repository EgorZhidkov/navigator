import { v4 as uuidv4 } from 'uuid';
import { createFeatures } from './createFeatures';
import { IRectangleСorners } from './mockData/types/IRectangleСorners';
import { getSpaceObject } from './getSpaceObject';
import { ISpace } from './mockData/types/ISpace';
import { logger } from '../utils/logger';

/**
 * Интерфейс для кластера объектов
 */
interface ICluster {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  bbox: number[][];
  number: number;
}

/**
 * Создает кластер на основе объектов в указанном квадрате
 * @param square - координаты квадрата
 * @param zoom - текущий уровень масштабирования
 * @param spaceData - исходные данные космических объектов
 * @returns кластер или массив Feature объектов (если объект один)
 */
export const createCluster = async (
  square: IRectangleСorners,
  zoom: number,
  spaceData: ISpace[]
): Promise<ICluster | any[] | null> => {
  try {
    const { leftBottomX, leftBottomY, rightTopX, rightTopY } = square;

    // Получаем координаты объектов в указанном квадрате
    const pointsWithCoordinates = (await getSpaceObject(
      square,
      true,
      spaceData
    )) as Array<{ x: number; y: number }>;

    // Если объектов нет, возвращаем null
    if (!pointsWithCoordinates || pointsWithCoordinates.length === 0) {
      return null;
    }

    // Если объект только один, возвращаем его как Feature
    if (pointsWithCoordinates.length === 1) {
      const feature = await createFeatures(square, zoom, spaceData);
      return feature.length > 0 ? feature : null;
    }

    // Вычисляем центр кластера
    let clusterX = 0;
    let clusterY = 0;

    pointsWithCoordinates.forEach((point) => {
      clusterX += point.x;
      clusterY += point.y;
    });

    // Создаем кластер
    return {
      type: 'Cluster',
      id: `cluster-${uuidv4()}`,
      geometry: {
        type: 'Point',
        coordinates: [
          clusterX / pointsWithCoordinates.length,
          clusterY / pointsWithCoordinates.length,
        ],
      },
      bbox: [
        [leftBottomX, leftBottomY],
        [rightTopX, rightTopY],
      ],
      number: pointsWithCoordinates.length,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при создании кластера: ${errorMessage}`);
    return null;
  }
};
