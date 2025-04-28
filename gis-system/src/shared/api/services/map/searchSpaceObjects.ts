import { axiosInstance } from '@/shared/configs'
import type { IMapFeature } from '@/entities/map'

interface SearchSpaceObjectsResponse {
  features: IMapFeature[]
}

interface SearchSpaceObjectsRequest {
  query: string
}

export const searchSpaceObjects = async (
  query: string,
): Promise<SearchSpaceObjectsResponse> => {
  try {
    const response = await axiosInstance.post<SearchSpaceObjectsResponse>(
      '/map/searchSpaceObjects',
      { query } as SearchSpaceObjectsRequest,
    )
    return response.data
  } catch (error) {
    console.error('Ошибка при поиске космических объектов:', error)
    return { features: [] }
  }
}
