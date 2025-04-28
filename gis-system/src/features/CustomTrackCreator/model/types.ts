export interface IPolygon {
  coordinates: number[][][]
  options?: {
    verticesLimit?: number
    editable?: boolean
  }
}

export type CustomTrackStep = 'instruction' | 'creation'
