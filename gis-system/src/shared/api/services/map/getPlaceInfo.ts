import { featureYandexMapStore } from '@/entities'
// eslint-disable-next-line boundaries/element-types
import type { IMapFeature } from '@/entities/featureOnMap/models'
import { axiosInstance } from '@/shared/configs'

export const getPlaceInfo = async (id: number): Promise<void> => {
  if (featureYandexMapStore.isLoading) return
  featureYandexMapStore.setLoading()
  try {
    const data = await axiosInstance<IMapFeature>({
      url: `/map/places/${id}`,
      method: 'GET',
    })
    featureYandexMapStore.selectFeature(data.data)
  } catch (error) {
    console.error(error)
  }
}
