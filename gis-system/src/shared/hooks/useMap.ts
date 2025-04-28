import { useEffect, useRef } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'

interface UseMapProps {
  center?: [number, number] // Центр карты (широта, долгота)
  zoom?: number // Уровень масштабирования
}

export const useMap = (
  mapElement: HTMLElement | null,
  options?: UseMapProps,
) => {
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (mapElement && !mapRef.current) {
      const { center = [37.618423, 55.751244], zoom = 10 } = options || {}

      // Создаем карту
      mapRef.current = new Map({
        target: mapElement,
        layers: [
          new TileLayer({
            source: new OSM(), // Используем OpenStreetMap как источник тайлов
          }),
        ],
        view: new View({
          center: center, // Центр карты
          zoom: zoom, // Уровень масштабирования
        }),
      })
    }

    // Очистка при размонтировании компонента
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined) // Очищаем карту
        mapRef.current = null
      }
    }
  }, [mapElement, options])

  return mapRef.current
}

import { createContext, useContext } from 'react'
import type { Map as TMap } from 'yandex-maps'

interface IMapViewContext {
  map: TMap | null
}
export const MapViewContext = createContext<IMapViewContext>({ map: null })

export const useYandexMap = (): TMap | null => {
  const mapViewContext = useContext(MapViewContext)

  if (!mapViewContext?.map) return null

  return mapViewContext.map
}
