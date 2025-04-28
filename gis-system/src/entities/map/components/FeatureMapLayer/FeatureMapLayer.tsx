import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { bbox as bboxStrategy } from 'ol/loadingstrategy'
import type { FC } from 'react'
import { useCallback, useEffect, useState } from 'react'
import Style from 'ol/style/Style'
import Fill from 'ol/style/Fill'
import Stroke from 'ol/style/Stroke'
import CircleStyle from 'ol/style/Circle.js'

import { useMapContext } from '@/shared'
import type { IMapState } from '@/shared/@types'
import { getFeatureMap } from '@/shared/api'

import type { IMapFeature } from '../../model'
import { mapStore } from '../../model'
import type { IMapCluster } from '../../model/@types'
import { convertBbox } from '@/shared/lib/map/converEPSG'
import { observer } from 'mobx-react-lite'
import { Point } from 'ol/geom'

export const FeatureMapLayer: FC = () => {
  const { map }: IMapState | void = useMapContext()
  const { data, setFeature, setFinished } = mapStore

  // const [vectorSource] = useState<VectorSource<Point>>(new VectorSource())
  // const [featuresLayer, setFeaturessLayer] = useState<VectorLayer<
  //   typeof vectorSource
  // > | null>(null)

  const zoomToCluster = useCallback(
    (cluster: IMapCluster) => {
      console.log('Увеличение масштаба для кластера:', cluster)
      map?.getView().setCenter(cluster.geometry.coordinates)
      map?.getView().setZoom(map?.getView()?.getZoom()! + 2)
    },
    [map],
  )

  useEffect(() => {
    if (!map) return
    const vectorSource = new VectorSource({
      strategy: bboxStrategy, // Загрузка данных только для видимой области
      loader: async (extent) => {
        console.log(extent)
        const bbox = convertBbox(extent).join(',')
        const zoom = map.getView().getZoom()

        try {
          const feature = await getFeatureMap(bbox, zoom)

          mapStore.setFinished(feature)

          const geoJsonObjects = {
            type: 'FeatureCollection',
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
            features: feature?.features,
          }

          console.log(geoJsonObjects)

          // Преобразование данных в GeoJSON
          const features = new GeoJSON().readFeatures(geoJsonObjects, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857',
          })

          console.log(features)

          vectorSource.addFeatures(features)
        } catch (error) {
          console.error('Ошибка загрузки данных:', error)
        }
      },
    })

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }),
    })

    map.addLayer(vectorLayer)

    // Обновление данных при изменении видимой области
    map.on('moveend', () => {
      vectorSource.clear() // Очистка старых данных
      // vectorSource.refresh() // Запрос новых данных
    })

    // Обработка кликов на объекты
    map.on('click', (event) => {
      map.forEachFeatureAtPixel(event.pixel, (feature) => {
        const properties = feature.getProperties()
        console.log('properties of Feature/Cluster ', properties)
        if (properties.type === 'Feature') {
          setFeature(properties as IMapFeature)
        } else if (properties.type === 'Cluster') {
          // zoomToCluster(properties)
        }
      })
    })

    return () => {
      map.removeLayer(vectorLayer) // Удаление слоя при размонтировании
    }
  }, [map, setFeature, zoomToCluster, data, setFinished])

  return null
}
