import { Map as YMap } from '@pbe/react-yandex-maps'
import type { YMapsApi } from '@pbe/react-yandex-maps/typings/util/typing'
import type { FC, ReactNode } from 'react'
import { useRef, useState } from 'react'
import useResizeObserver from 'use-resize-observer'
import type { Map as TMap } from 'yandex-maps'

import { MapViewContext } from '@shared/hooks/useMap'
import { YandexMapLayout } from '@/shared/ui'
import { DEFAULT_ZOOM, MAP_CENTER } from '@/shared'

export type TMapProps = {
  defaultState?: ymaps.IMapState
  children?: ReactNode
}

export const YandexMap: FC<TMapProps> = ({ defaultState = {}, children }) => {
  const mapDefaultState: ymaps.IMapState = {
    center: defaultState.center || MAP_CENTER,
    zoom: defaultState.zoom || DEFAULT_ZOOM,
    controls: defaultState.controls || [],
  }
  const mapRef = useRef<TMap | null>(null)
  const [, setMapInstance] = useState<YMapsApi | null>(null)

  const { ref: resizeObserverRef } = useResizeObserver<HTMLDivElement>({
    onResize: () => {
      mapRef.current?.container?.fitToViewport()
    },
  })
  return (
    <MapViewContext.Provider value={{ map: mapRef.current }}>
      <div
        ref={resizeObserverRef}
        className="w-full h-full relative overflow-hidden"
      >
        <YandexMapLayout>
          <YMap
            instanceRef={(ref) => {
              if (ref) mapRef.current = ref
            }}
            options={{
              yandexMapDisablePoiInteractivity: true,
            }}
            modules={[
              'util.bind',
              'util.bounds',
              'templateLayoutFactory',
              'layout.ImageWithContent',
              'layout.PieChart',
              'layout.Image',
              'geoObject.addon.balloon',
              'geoObject.addon.hint',
              'geoObject.addon.editor',
            ]}
            defaultState={mapDefaultState}
            width="100%"
            height="100%"
            onLoad={setMapInstance}
          >
            {children}
          </YMap>
        </YandexMapLayout>
      </div>
    </MapViewContext.Provider>
  )
}
