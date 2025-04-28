import { makeAutoObservable } from 'mobx'
import type { IMapFeature } from '@/entities/map'

class SearchStore {
  public searchQuery: string = ''
  public searchResults: IMapFeature[] = []
  public isSearching: boolean = false
  public selectedResult: IMapFeature | null = null

  public constructor() {
    makeAutoObservable(this)
  }

  public setSearchQuery = (query: string) => {
    this.searchQuery = query
  }

  public setSearchResults = (results: IMapFeature[]) => {
    this.searchResults = results
  }

  public setSearching = (isSearching: boolean) => {
    this.isSearching = isSearching
  }

  public setSelectedResult = (result: IMapFeature | null) => {
    this.selectedResult = result
  }

  public resetSearch = (): void => {
    this.searchQuery = ''
    this.searchResults = []
    this.selectedResult = null
    this.isSearching = false
  }
}

export const searchStore = new SearchStore()
