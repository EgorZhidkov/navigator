import clsx from 'clsx'
import { memo, useLayoutEffect, useState, useEffect } from 'react'
import type { Coordinate } from 'ol/coordinate'
import MapInstance from 'ol/Map'
import View from 'ol/View'
import type { ReactNode } from 'react'

import type { IMapState } from '@/shared/@types'
import { MapContext } from '@/shared/lib'

interface MapProps {
  children?: ReactNode
  zoom: number
  center: Coordinate
  className?: string
  minZoom?: number
  maxZoom?: number
}

export const MapProvider = memo((props: MapProps) => {
  const { className, minZoom, maxZoom, children, zoom, center } = props

  const [mapState, setMapState] = useState<IMapState>({})
  const mapTheme = 'default' // TODO: потом в стор может быть убрать

  useLayoutEffect(() => {
    if (!mapState.map) {
      const view = new View({
        // projection
        center,
        zoom,
        minZoom,
        maxZoom,
      })

      const olMap = new MapInstance({
        view,
        controls: [],
      })

      olMap.setTarget('map')

      setMapState({
        map: olMap,
        view,
        mapTheme: 'default',
      })
    }
  }, [center, mapState.map, maxZoom, minZoom, zoom])

  useLayoutEffect(() => {
    if (mapState.map) {
      mapState.map.updateSize()
    }
  }, [mapState.map])

  useEffect(() => {
    setMapState((s) => ({ ...s, mapTheme }))
  }, [mapTheme])

  return (
    <div id="map" className={clsx(className, 'grow relative')}>
      <MapContext.Provider value={mapState}>{children}</MapContext.Provider>
    </div>
  )
})
