export interface IMapFeatureCollection {
  type: string
  features: Array<IMapFeature>
}

export interface IMapFeature {
  id: number
  system_id: string
  title: string
  info: string | null
  photo?: string
  geo: {
    longitude: number
    latitude: number
  }
}
