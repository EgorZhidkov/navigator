export type FilterType = 'checkbox' | 'radio' | 'range'

export interface IMapFilter {
  id: string
  type: FilterType
  label: string
  options?: Array<{
    value: string
    label: string
  }>
  range?: {
    min: number
    max: number
    step?: number
  }
}

export interface IMapFiltersState {
  filters: IMapFilter[]
  selectedFilters: Record<string, string | string[] | [number, number]>
  isFiltersWindowOpen: boolean
}
