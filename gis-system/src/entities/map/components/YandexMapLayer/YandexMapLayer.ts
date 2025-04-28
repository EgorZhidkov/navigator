import TileLayer from 'ol/layer/Tile'
import { XYZ } from 'ol/source'
import type { FC } from 'react'
import { useEffect, useState } from 'react'

import type { IMapState } from '@/shared/@types'
import { useMapContext } from '@/shared'

import {
  YANDEX_MAP_SAT_URL,
  YANDEX_MAP_URL,
  YANDEX_ROADS_MAP_URL,
} from '../../const'
import type { IMapLayer } from '../../lib'

export const YandexMapLayer: FC = () => {
  const { map }: IMapState | void = useMapContext()
  const mapLayer: IMapLayer = 'map' // TODO: вынести в стор
  const [hybridLayer, setHybridLayer] = useState<TileLayer<XYZ> | null>(null)

  useEffect(() => {
    if (!map) return

    const yandexLayer = new TileLayer({
      source: new XYZ({
        url: mapLayer === 'map' ? YANDEX_MAP_URL : YANDEX_MAP_SAT_URL,
        crossOrigin: 'Anonymous',
      }),
    })

    map.addLayer(yandexLayer)

    if (mapLayer === 'hybrid') {
      const roadsLayer = new TileLayer({
        source: new XYZ({
          url: YANDEX_ROADS_MAP_URL,
          crossOrigin: 'Anonymous',
        }),
      })
      map.addLayer(roadsLayer)
      setHybridLayer(hybridLayer)
    }

    // eslint-disable-next-line consistent-return
    return () => {
      map?.removeLayer(yandexLayer)
    }
  }, [hybridLayer, map, mapLayer])

  useEffect(() => {
    if (mapLayer !== 'hybrid') {
      setHybridLayer(null)
    }

    return () => {
      if (hybridLayer) {
        map?.removeLayer(hybridLayer)
      }
    }
  }, [hybridLayer, map, mapLayer])

  return null
}
