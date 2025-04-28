import type { IMapFeature } from '@/entities'
import { mapStore } from '@/entities'
import { IMapFeatureCollection } from '@/entities/map/model/@types'
import { axiosInstance } from '@/shared/configs'

export const getFeatureMap = async (
  bbox: string,
  zoom: number | undefined,
): Promise<IMapFeatureCollection | undefined> => {
  if (mapStore.isLoading) return
  mapStore.setLoading()
  try {
    const feature = await axiosInstance<IMapFeatureCollection>({
      method: 'post',
      url: '/map/calculateMapData',
      params: {
        bbox,
        zoom,
      },
    })
    console.log(feature)
    mapStore.setReady()
    return feature.data
  } catch (error) {
    mapStore.setError(error)
  }
}
