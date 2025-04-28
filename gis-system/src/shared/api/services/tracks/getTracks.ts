import { trackStore } from '@/entities'
import type { IRoute } from '@/entities'
import { axiosInstance } from '@/shared/configs'

export const getTracks = async (): Promise<void> => {
  if (trackStore.isLoading) return
  trackStore.setLoading()
  try {
    const data = await axiosInstance<IRoute[]>({
      url: '/map/routes',
      method: 'GET',
    })
    trackStore.setBaseTracks(data.data)
  } catch (error) {
    console.error(error)
  }
}
