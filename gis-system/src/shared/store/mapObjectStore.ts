import { makeAutoObservable } from 'mobx'

import type { EMapObjectsType } from '../const'

type MapObject =
  | ymaps.GeoObject
  | ymaps.ObjectManager
  | ymaps.multiRouter.MultiRoute
  | ymaps.Placemark

class MapObjectsStore {
  public objects: Map<EMapObjectsType, MapObject>

  constructor() {
    makeAutoObservable(this)
    this.objects = new Map<EMapObjectsType, MapObject>()
  }

  addObject = (key: EMapObjectsType, object: MapObject, map: ymaps.Map) => {
    this.objects.set(key, object)
    map.geoObjects.add(object)
  }

  removeObject = (key: EMapObjectsType, map: ymaps.Map) => {
    const object = this.objects.get(key)
    if (object) {
      map.geoObjects.remove(object)
      this.objects.delete(key)
    }
  }

  clearAll = (map: ymaps.Map) => {
    this.objects.forEach((object) => {
      map.geoObjects.remove(object)
    })
    this.objects.clear()
  }
}

export const mapObjectsStore = new MapObjectsStore()
