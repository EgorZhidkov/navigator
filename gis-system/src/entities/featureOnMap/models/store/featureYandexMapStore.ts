import { makeAutoObservable } from 'mobx'

import { ERequestStatus } from '@/shared'

import type { IMapFeature } from '../@types'
class FeatureYandexMapStore {
  public selectedFeature: IMapFeature | null = null
  public status: ERequestStatus = ERequestStatus.Pending
  public placeId: number | null = null

  public constructor() {
    makeAutoObservable(this)
  }

  public selectFeature = (feature: IMapFeature) => {
    this.selectedFeature = feature
    this.status = ERequestStatus.Ready
  }

  public setPlaceId = (id: number) => {
    this.placeId = id
  }

  public unselectFeature = () => {
    this.selectedFeature = null
  }
  public setLoading(): void {
    this.status = ERequestStatus.Loading
  }
  public get isLoading(): boolean {
    return this.status === ERequestStatus.Loading
  }

  public get isError(): boolean {
    return this.status === ERequestStatus.Error
  }
}

export const featureYandexMapStore = new FeatureYandexMapStore()
