export interface IMapFeature {
  id: number
  name: string
  description?: string
  type_id: number
  type_name: string
  opening_hours?: string
  coordinates?: {
    longitude: number
    latitude: number
  }
}
