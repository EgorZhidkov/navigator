import { makeAutoObservable } from 'mobx'

import type { IMapFilter } from '../@types'
import { mapFiltersConfig } from '../../const'

class MapFiltersStore {
  public filters: IMapFilter[] = mapFiltersConfig
  public selectedFilters: Record<string, string | string[] | [number, number]> =
    {}
  public isFiltersWindowOpen: boolean = false

  public constructor() {
    makeAutoObservable(this)
  }

  public setFilters = (filters: IMapFilter[]): void => {
    this.filters = filters
  }

  public updateFilter = (
    filterId: string,
    value: string | string[] | [number, number],
  ): void => {
    this.selectedFilters[filterId] = value
  }

  public resetFilters = (): void => {
    this.selectedFilters = {}
  }

  public toggleFiltersWindow = (): void => {
    this.isFiltersWindowOpen = !this.isFiltersWindowOpen
  }

  public get activeFilters(): Array<
    [string, string | string[] | [number, number]]
  > {
    return Object.entries(this.selectedFilters).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return value !== undefined && value !== ''
    })
  }
}

export const mapFiltersStore = new MapFiltersStore()
