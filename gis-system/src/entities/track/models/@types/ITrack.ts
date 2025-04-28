export interface ITrack {
  id: number
  label: string
  points: { title: string; points: number[] }[]
}

export interface IYandexTrack {
  id: number
  title: string[]
  points: Array<number[]>
}

export interface IRoutePoint {
  id: number
  route_id: number
  place_id: number
  order_index: number
  description?: string
  visit_time?: string
  created_at: string
  updated_at: string
  place: {
    id: number
    name: string
    description?: string
    type_id: number
    type_name: string
    opening_hours?: string
    coordinates: {
      longitude: number
      latitude: number
    }
  }
}

export interface IRoute {
  id: number
  name: string
  description?: string
  type_id: number
  author_id?: number
  created_at: string
  updated_at: string
  points: IRoutePoint[]
}
