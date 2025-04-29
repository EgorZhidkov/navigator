import { mockTrackFeatures } from './mockData';
import { IPolygon } from './types';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - проблема с экспортами в @turf/turf
import * as turf from '@turf/turf';
import { logger } from '../utils/logger';
import { ITracks } from './getTrackByObjects';

/**
 * Интерфейс для точки внутри полигона
 */
interface IPointFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    title?: string;
    'marker-color'?: string;
    [key: string]: unknown;
  };
}

/**
 * Создает трек на основе полигональной области на карте
 * @param polygon - координаты полигона в формате GeoJSON
 * @returns объект трека в формате ITracks
 */
export const createTrackFromPolygon = (polygon: IPolygon): ITracks => {
  try {
    // Создаем точки из объектов карты
    const allPoints = turf.points([
      ...mockTrackFeatures.map((item) => [
        item.geo.longitude,
        item.geo.latitude,
      ]),
    ]);

    // Используем либо переданный полигон, либо дефолтный (Москва)
    const polygonTurf = polygon
      ? turf.polygon(polygon)
      : turf.polygon([
          [
            [37.50958327672509, 55.844935369707315],
            [37.37500075719383, 55.693975004344296],
            [37.81170730016258, 55.62332578326719],
            [37.9064643802407, 55.80086920753016],
            [37.50958327672509, 55.844935369707315],
          ],
        ]);

    // Находим точки внутри полигона
    const ptsWithin = turf.pointsWithinPolygon(allPoints, polygonTurf);

    // Добавляем дополнительные свойства к каждой точке
    turf.featureEach(ptsWithin, function (currentFeature: any) {
      if (
        !currentFeature ||
        !currentFeature.geometry ||
        !currentFeature.geometry.coordinates
      ) {
        return;
      }

      const feature = mockTrackFeatures.find(
        (item) =>
          item.geo.longitude === currentFeature.geometry.coordinates[0] &&
          item.geo.latitude === currentFeature.geometry.coordinates[1]
      );

      if (feature) {
        currentFeature.properties['title'] = feature.title;
        currentFeature.properties['marker-color'] = '#000';
      } else {
        currentFeature.properties['title'] = 'Неизвестный объект';
        currentFeature.properties['marker-color'] = '#999';
      }
    });

    // Логируем количество найденных точек
    logger.info(`Найдено ${ptsWithin.features.length} точек внутри полигона`);

    // Преобразуем найденные точки в формат точек для трека
    const trackPoints = ptsWithin.features.map((item: IPointFeature) => ({
      title: item.properties.title || 'Неизвестный объект',
      points: item.geometry.coordinates,
    }));

    // Формируем результат в формате ITracks
    return {
      id: 0, // Используем 0 как id по умолчанию
      system_id: 'Интересный маршрут',
      title: 'Интересный маршрут',
      info: null,
      photo: undefined,
      points: trackPoints,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при создании трека из полигона: ${errorMessage}`);

    // Возвращаем пустой трек в случае ошибки
    return {
      id: 0,
      system_id: 'Пустой трек (ошибка)',
      title: 'Пустой трек (ошибка)',
      info: null,
      photo: undefined,
      points: [],
    };
  }
};
