import { BaseApiStoreClass } from '@/shared'

import { action, computed, makeObservable, observable, override } from 'mobx'
import getGeolocation from './getGeolocation'

export class GeolocationStore extends BaseApiStoreClass<
  [number, number] | undefined | null
> {
  public geolocation: ymaps.geolocation | null = null
  public geolocationPosition: [number, number] | null = null
  public map: ymaps.Map | null = null
  public constructor() {
    super()
    makeObservable(this, {
      data: override,
      geolocation: observable,
      geolocationPosition: observable,
      map: observable,
      setGeolocation: action,
      setGeolocationPosition: action,
      setMap: action,
      getStringFormatData: computed,
    })
  }

  public setGeolocation(geolocation: ymaps.geolocation) {
    this.geolocation = geolocation
    if (this.map) {
      getGeolocation(this.map).then((coords) => {
        this.data = coords
      })
    }
  }

  public setMap(map: ymaps.Map) {
    this.map = map
    if (this.geolocation) {
      getGeolocation(map).then((coords) => {
        this.data = coords
      })
    }
  }

  public setGeolocationPosition(
    geolocationPosition: [number, number] | null,
  ): void {
    if (
      !this.geolocationPosition ||
      Array.from(this.geolocationPosition || [])[0] !==
        Array.from(geolocationPosition || [])[0] ||
      Array.from(this.geolocationPosition || [])[1] !==
        Array.from(geolocationPosition || [])[1]
    ) {
      this.geolocationPosition = geolocationPosition
    }
  }

  public get getStringFormatData(): string {
    if (!this.data || isNaN(this.data[0]) || isNaN(this.data[1])) {
      return 'Не удалось получить координаты'
    }
    return this.data?.join(',')
  }
}

export const geolocationStore = new GeolocationStore()
