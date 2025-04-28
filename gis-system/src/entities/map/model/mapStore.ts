import { action, makeObservable, observable, override } from 'mobx'

import { BaseApiStoreClass } from '@/shared'

import type { IMapFeature, IMapFeatureCollection } from './@types'

class MapStore extends BaseApiStoreClass<IMapFeatureCollection> {
  public selectedFeature: IMapFeature | null = null

  public constructor() {
    super()
    makeObservable(this, {
      data: override,
      selectedFeature: observable,
      setFeature: action,
    })
  }

  public setFeature(feature: IMapFeature) {
    this.selectedFeature = feature
  }
}

export const mapStore = new MapStore()
