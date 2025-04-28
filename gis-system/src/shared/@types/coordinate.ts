export type TCoord = [number, number]
export type TExtent = [number, number, number, number]
export type TExtentCorners = {
  leftBotton: {
    lon: number
    lat: number
  }
  rightTop: {
    lon: number
    lat: number
  }
}

export type THem = 'N' | 'S' | 'E' | 'W'
export type TCoordType = 'lon' | 'lat'

export interface IOptionsTypes {
  type: TCoordType
  value: number
}
