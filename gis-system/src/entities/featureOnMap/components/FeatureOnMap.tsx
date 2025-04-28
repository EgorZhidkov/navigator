import type { FC } from 'react'
import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { withYMaps } from '@pbe/react-yandex-maps'
import type { YMapsApi } from '@pbe/react-yandex-maps/typings/util/typing'
import type { ObjectManager } from 'yandex-maps'

import { EMapObjectsType, mapObjectsStore, useYandexMap } from '@/shared'
import { featureYandexMapStore } from '@/entities'

import type { IMapFeature } from '../models'

interface FeatureOnMapProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ymaps?: YMapsApi & { RemoteObjectManager: any }
}

const FeatureOnMap: FC<FeatureOnMapProps> = observer(({ ymaps }) => {
  const map = useYandexMap()
  const { selectFeature, setPlaceId } = featureYandexMapStore

  useEffect(() => {
    if (!map || !ymaps) return

    const remoteObjectManager: ObjectManager = new ymaps.RemoteObjectManager(
      `http://localhost:8001/calculateMapData?bbox=%b&zoom=%z`,
      {
        clusterize: true,
        gridSize: 64,
        // Стили для отдельных объектов
        geoObjectOpenBalloonOnClick: false,
        geoObjectIconLayout: 'default#image',
        geoObjectIconImageHref:
          'https://cdn-icons-png.flaticon.com/512/3179/3179068.png',
        geoObjectIconImageSize: [32, 32],
        geoObjectIconImageOffset: [-16, -16],
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: false,
        preset: 'islands#redClusterIcons',
      },
    )

    remoteObjectManager.objects.events.add('click', (event) => {
      const objectId = event.get('objectId') as string
      const feature = remoteObjectManager.objects.getById(objectId) as {
        properties: IMapFeature
      }
      if (feature?.properties) {
        setPlaceId(feature.properties.id)
      }
    })

    mapObjectsStore.addObject(
      EMapObjectsType.objectManager,
      remoteObjectManager,
      map,
    )

    return () => {
      mapObjectsStore.removeObject(EMapObjectsType.objectManager, map)
    }
  }, [ymaps, map, selectFeature])

  return null
})

export default withYMaps(FeatureOnMap, true, ['RemoteObjectManager'])
