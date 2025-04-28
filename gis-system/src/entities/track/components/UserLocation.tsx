import { useYMaps } from '@pbe/react-yandex-maps'
import { observer } from 'mobx-react-lite'
import { useEffect, useRef } from 'react'

import { EMapObjectsType, mapObjectsStore, useYandexMap } from '@/shared'

import { navigationStore } from '../models/store/navigationStore'

export const UserLocation = observer(() => {
  const map = useYandexMap()
  const ymaps = useYMaps(['Placemark'])
  const userMarkerRef = useRef<ymaps.Placemark | null>(null)

  console.log(navigationStore.state)

  useEffect(() => {
    if (!map || !ymaps || !navigationStore.state.currentPosition) return

    // Удаляем старый маркер, если он есть
    if (userMarkerRef.current) {
      map.geoObjects.remove(userMarkerRef.current)
    }

    // Создаем новый маркер с текущей позицией
    const userMarker = new ymaps.Placemark(
      navigationStore.state.currentPosition,
      {
        balloonContent: 'Вы здесь',
      },
      {
        preset: 'islands#blueCircleDotIcon',
        iconColor: '#2196F3',
      },
    )

    // Добавляем маркер на карту
    mapObjectsStore.addObject(EMapObjectsType.geolocation, userMarker, map)

    userMarkerRef.current = userMarker

    // Центрируем карту на позиции пользователя
    map.setCenter(navigationStore.state.currentPosition, map.getZoom())

    return () => {
      if (userMarkerRef.current) {
        mapObjectsStore.removeObject(EMapObjectsType.geolocation, map)
      }
    }
  }, [map, ymaps])

  return null
})
