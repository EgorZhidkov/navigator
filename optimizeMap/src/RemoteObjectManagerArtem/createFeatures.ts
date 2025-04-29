import { logger } from '../utils/logger';
import { getSpaceObject } from './getSpaceObject';
import { ISpace } from './mockData/types/ISpace';
import { IRectangleСorners } from './mockData/types/IRectangleСorners';

/**
 * Интерфейс для объекта функции на карте
 */
interface IFeature {
  type: string;
  id: string;
  geometry: {
    type: string;
    coordinates: number[];
    object: string;
  };
  properties: ISpace;
  options: {
    cursor: string;
    iconShape: {
      type: string;
      coordinates: number[];
      radius: number;
      zIndex: number;
    };
  };
}

/**
 * Создает объект Feature на основе данных космического объекта
 * @param item - объект космического аппарата
 * @returns Feature объект для отображения на карте
 */
const createSpaceObjectFeature = (item: ISpace): IFeature => {
  if (!item.geo || !item.geo.latitude || !item.geo.longitude) {
    throw new Error(`Объект с id ${item.id} не имеет корректных координат`);
  }

  const latitude = item.geo.latitude;
  const longitude = item.geo.longitude;

  return {
    type: 'Feature',
    id: `space-${item.id}`,
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
      object: 'space',
    },
    properties: item,
    options: {
      cursor: 'pointer',
      iconShape: {
        type: 'Circle',
        coordinates: [0, 0],
        radius: 14,
        zIndex: 652,
      },
    },
  };
};

/**
 * Создает массив Features на основе объектов в указанном прямоугольнике
 * @param square - координаты прямоугольника
 * @param zoom - текущий уровень масштабирования
 * @param spaceData - исходные данные космических объектов
 * @returns массив Feature объектов для отображения на карте
 */
export const createFeatures = async (
  square: IRectangleСorners,
  zoom: number,
  spaceData: ISpace[]
): Promise<IFeature[]> => {
  try {
    // Получаем объекты в указанном прямоугольнике
    const spaceObjects = (await getSpaceObject(
      square,
      false,
      spaceData
    )) as ISpace[];

    if (!spaceObjects || spaceObjects.length === 0) {
      return [];
    }

    // Создаем Feature объекты для каждого объекта
    const features = spaceObjects
      .filter(
        (object) =>
          object && object.geo && object.geo.latitude && object.geo.longitude
      )
      .map((mapObject) => createSpaceObjectFeature(mapObject));

    // Логируем результат
    logger.info(`Создано ${features.length} Feature объектов для отображения`);

    return features;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при создании Feature объектов: ${errorMessage}`);
    return [];
  }
};
