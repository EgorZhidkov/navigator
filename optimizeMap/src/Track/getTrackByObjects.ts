import { ISpace } from '../RemoteObjectManagerArtem/mockData/types/ISpace';
import { logger } from '../utils/logger';

/**
 * Интерфейс для трека маршрута
 */
export interface ITracks {
  id: number;
  system_id: string;
  title: string;
  info: string | null;
  photo?: string;
  geo: {
    longitude: number;
    latitude: number;
  };
}

let firstTrack: ITracks[] = [
  {
    id: 1,
    system_id: 'ISS',
    title: 'Международная космическая станция',
    info: 'МКС - многонациональный космический исследовательский проект',
    photo: 'https://example.com/iss.jpg',
    geo: {
      longitude: 0,
      latitude: 0,
    },
  },
];

let secondTrack: ITracks[] = [
  {
    id: 2,
    system_id: 'Tiangong',
    title: 'Китайская космическая станция',
    info: 'Тяньгун - китайская орбитальная станция',
    photo: 'https://example.com/tiangong.jpg',
    geo: {
      longitude: 0,
      latitude: 0,
    },
  },
];

/**
 * Преобразует массив объектов ISpace в точки для трека
 * @param data - массив объектов космических аппаратов
 * @returns массив точек с заголовками и координатами
 */
export const getTrackByObjects = (objects: ITracks[]) => {
  return objects.map((object) => ({
    title: object.title,
    points: [object.geo.longitude, object.geo.latitude],
  }));
};

/**
 * Возвращает доступные треки маршрутов
 * @returns массив маршрутов с точками
 */
export const getTracksPoints = (): ITracks[] => {
  try {
    return [
      {
        id: 0,
        system_id: 'Интересный маршрут',
        title: 'Интересный маршрут',
        info: null,
        photo: undefined,
        geo: {
          longitude: 0,
          latitude: 0,
        },
      },
      {
        id: 1,
        system_id: 'Неинтересный маршрут',
        title: 'Неинтересный маршрут',
        info: null,
        photo: undefined,
        geo: {
          longitude: 0,
          latitude: 0,
        },
      },
    ];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(`Ошибка при получении треков: ${errorMessage}`);
    return [];
  }
};
