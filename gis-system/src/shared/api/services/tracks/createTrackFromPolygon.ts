import { axiosInstance } from '@/shared/configs'
import type { ITrack } from '@/entities'
import { trackStore } from '@/entities'

// Определяем тип полигона внутри API для избежания циклических зависимостей
interface IPolygon {
  coordinates: number[][][]
}

export const createTrackFromPolygon = async (
  polygon: IPolygon,
): Promise<void> => {
  try {
    const { data } = await axiosInstance<ITrack>({
      url: '/map/createTrackFromPolygon',
      method: 'POST',
      data: { polygon: polygon.coordinates },
    })

    // Добавляем созданный маршрут к базовым маршрутам
    const updatedTracks = [...trackStore.baseTracks, data]
    trackStore.setBaseTracks(updatedTracks)

    // Выбираем созданный маршрут как текущий
    trackStore.chooseTrack(data)
  } catch (error) {
    console.error(error)
    throw new Error('Не удалось создать маршрут')
  }
}
