import { useYMaps, withYMaps } from '@pbe/react-yandex-maps'
import { observer } from 'mobx-react-lite'
import { useEffect, type FC } from 'react'

import { EMapObjectsType, mapObjectsStore, useYandexMap } from '@/shared'

import { trackStore } from '../models'
import { navigationStore } from '../models/store/navigationStore'

import { NavigationContainer } from './NavigationContainer'

interface ISegment {
  street: string
  action: string
  length: number
  coordinates: number[][]
  duration: number
}

const Track: FC = observer(() => {
  const { track } = trackStore
  const map = useYandexMap()
  const ymaps = useYMaps([
    'multiRouter.MultiRoute',
    'GeoObjectCollection',
    'Placemark',
    'control.GeolocationControl',
    'geolocation',
  ])

  const checkHttps = () => {
    if (
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost'
    ) {
      console.warn(
        'Геолокация работает только по HTTPS. Текущий протокол:',
        window.location.protocol,
      )
      return false
    }
    return true
  }

  const requestGeolocationPermission = async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      if (result.state === 'denied') {
        console.error('Доступ к геолокации запрещен в настройках браузера')
        return false
      }
      if (result.state === 'prompt') {
        // Запрашиваем разрешение через getCurrentPosition
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 },
          )
        })
      }
      return true
    } catch (error) {
      console.error('Ошибка при запросе разрешения геолокации:', error)
      return false
    }
  }

  useEffect(() => {
    if (map && ymaps && track) {
      let pointsCollection: ymaps.GeoObjectCollection | null = null
      let geolocationControl: ymaps.control.GeolocationControl | null = null

      const initializeMap = async () => {
        // Проверяем HTTPS
        console.error('Для работы геолокации необходим HTTPS')
        // Строим маршрут без геолокации
        const multiRoute = new ymaps.multiRouter.MultiRoute(
          {
            params: {
              results: 1,
              routingMode: 'auto',
            },
            referencePoints: track.points!.map((item) => [
              item.place!.coordinates!.latitude,
              item.place!.coordinates!.longitude,
            ]),
          },
          {
            boundsAutoApply: true,
            routeActiveStrokeColor: '#2196F3',
            routeActiveStrokeWidth: 2,
            routeStrokeWidth: 0,
            wayPointVisible: false,
          },
        )
        mapObjectsStore.addObject(EMapObjectsType.activeTrack, multiRoute, map)
        pointsCollection = new ymaps.GeoObjectCollection()

        // Добавляем точки с кастомными иконками
        track.points!.forEach((point, index) => {
          const placemark = new ymaps.Placemark(
            [
              point.place!.coordinates!.latitude,
              point.place!.coordinates!.longitude,
            ],
            {
              balloonContentHeader: `Точка ${index + 1}`,
              balloonContentBody: point.place!.name || 'Описание отсутствует',
            },
            {
              iconLayout: 'default#image',
              iconImageHref:
                'https://cdn-icons-png.flaticon.com/512/3179/3179068.png',
              iconImageSize: [32, 32],
              iconImageOffset: [-16, -16],
            },
          )
          pointsCollection?.add(placemark)
        })

        pointsCollection && map.geoObjects.add(pointsCollection)

        //   // Запрашиваем разрешение на геолокацию
        //   const hasPermission = await requestGeolocationPermission()
        //   if (!hasPermission) {
        //     console.error('Нет разрешения на использование геолокации')
        //     return
        //   }

        //   // Добавляем контрол геолокации
        //   geolocationControl = new ymaps.control.GeolocationControl({
        //     options: {
        //       position: { right: 10, top: 10 },
        //     },
        //   })
        //   map.controls.add(geolocationControl)

        //   // Получаем текущее местоположение
        //   try {
        //     const result = await ymaps.geolocation.get({
        //       provider: 'browser',
        //       mapStateAutoApply: true,
        //       autoReverseGeocode: false,
        //     })

        //     if (!result?.geoObjects?.get(0)?.geometry) {
        //       throw new Error('Не удалось получить координаты')
        //     }

        //     const userLocation = result.geoObjects
        //       .get(0)
        //       .geometry.getCoordinates()

        //     // Создаем коллекцию для точек

        //     // Проверяем наличие кэшированного маршрута
        //     const cachedRoute = trackStore.getCachedRoute(track.id)

        //     // Создаем маршрут с кастомными стилями
        //     const multiRoute = new ymaps.multiRouter.MultiRoute(
        //       cachedRoute?.routeData || {
        //         params: {
        //           results: 1,
        //           routingMode: 'auto',
        //         },
        //         referencePoints: [
        //           userLocation,
        //           ...track.points!.map((item) => [
        //             item.place!.coordinates!.latitude,
        //             item.place!.coordinates!.longitude,
        //           ]),
        //         ],
        //       },
        //       {
        //         boundsAutoApply: true,
        //         routeActiveStrokeColor: '#2196F3',
        //         routeActiveStrokeWidth: 2,
        //         routeStrokeWidth: 0,
        //         wayPointVisible: false,
        //       },
        //     )

        //     // Удаляем старые объекты с карты
        //     if (mapObjectsStore.objects.has(EMapObjectsType.activeTrack)) {
        //       mapObjectsStore.removeObject(EMapObjectsType.activeTrack, map)
        //     }

        //     // Добавляем маршрут и точки на карту
        //     mapObjectsStore.addObject(
        //       EMapObjectsType.activeTrack,
        //       multiRoute,
        //       map,
        //     )

        //     console.log(pointsCollection)

        //     // Сохраняем маршрут в store
        //     trackStore.setYandexTrack(multiRoute)

        //     // Ждем построения маршрута
        //     multiRoute.model.events.add('requestsuccess', () => {
        //       try {
        //         // Получаем активный маршрут
        //         const activeRoute = multiRoute.getActiveRoute()
        //         if (!activeRoute) {
        //           throw new Error('Активный маршрут не найден')
        //         }

        //         // Получаем все пути маршрута
        //         const paths = activeRoute.getPaths()
        //         if (!paths || paths.getLength() === 0) {
        //           throw new Error('Пути маршрута не найдены')
        //         }

        //         // Собираем все сегменты из всех путей
        //         const allSegments: ISegment[] = []
        //         let allCoordinates: number[][] = []

        //         for (let i = 0; i < paths.getLength(); i++) {
        //           const way = paths.get(i)
        //           if (!way) continue

        //           const segments = way.getSegments()
        //           if (!segments) continue

        //           // Собираем координаты
        //           const wayGeometry = way.geometry
        //           if (wayGeometry) {
        //             const wayCoordinates = wayGeometry.getCoordinates()
        //             if (wayCoordinates) {
        //               allCoordinates = allCoordinates.concat(wayCoordinates)
        //             }
        //           }

        //           // Собираем сегменты
        //           for (let j = 0; j < segments.length; j++) {
        //             const segment = segments[j]
        //             const street = segment.getStreet()
        //             const action = segment.getHumanAction()
        //             const length = segment.getLength()
        //             const coordinates = segment.geometry.getCoordinates()

        //             allSegments.push({
        //               street: street || '',
        //               action: action || 'Продолжайте движение',
        //               length,
        //               coordinates,
        //               duration: length / 50, // примерная скорость 50 м/мин
        //             })
        //           }
        //         }

        //         // Если не удалось получить сегменты, создаем базовые
        //         if (allSegments.length === 0) {
        //           const points = [
        //             userLocation,
        //             ...track.points!.map((point) => [
        //               point.place!.coordinates!.latitude,
        //               point.place!.coordinates!.longitude,
        //             ]),
        //           ]
        //           points.slice(0, -1).forEach((point, index) => {
        //             allSegments.push({
        //               coordinates: [point, points[index + 1]],
        //               street:
        //                 index === 0
        //                   ? 'Ваше местоположение'
        //                   : track.points![index - 1].place!.name || '',
        //               action: `Направляйтесь к точке ${index + 1}`,
        //               length: 0,
        //               duration: 0,
        //             })
        //           })
        //         }

        //         // Если не удалось получить координаты, используем точки трека
        //         if (allCoordinates.length === 0) {
        //           allCoordinates = [
        //             userLocation,
        //             ...track.points.map((point) => [
        //               point.place!.coordinates!.latitude,
        //               point.place!.coordinates!.longitude,
        //             ]),
        //           ]
        //         }

        //         // Запускаем навигацию с полученными данными
        //         navigationStore.startNavigation({
        //           coordinates: allCoordinates,
        //           segments: allSegments,
        //         })
        //       } catch (error) {
        //         console.error('Ошибка при обработке маршрута:', error)
        //         // Запускаем базовую навигацию по точкам
        //         const points = [
        //           userLocation,
        //           ...track.points!.map((point) => [
        //             point.place!.coordinates!.latitude,
        //             point.place!.coordinates!.longitude,
        //           ]),
        //         ]
        //         const fallbackRouteData = {
        //           coordinates: points,
        //           segments: points.slice(0, -1).map((point, index) => ({
        //             coordinates: [point, points[index + 1]],
        //             street:
        //               index === 0
        //                 ? 'Ваше местоположение'
        //                 : track.points![index - 1].place!.name || '',
        //             action: `Направляйтесь к точке ${index + 1}`,
        //             length: 0,
        //             duration: 0,
        //           })),
        //         }
        //         navigationStore.startNavigation(fallbackRouteData)
        //       }
        //     })
        //   } catch (error) {
        //     console.error('Ошибка получения местоположения:', error)
        //     // Если не удалось получить местоположение, строим маршрут без него
        //     const multiRoute = new ymaps.multiRouter.MultiRoute(
        //       {
        //         params: {
        //           results: 1,
        //           routingMode: 'auto',
        //         },
        //         referencePoints: track.points!.map((item) => [
        //           item.place!.coordinates!.latitude,
        //           item.place!.coordinates!.longitude,
        //         ]),
        //       },
        //       {
        //         boundsAutoApply: true,
        //         routeActiveStrokeColor: '#2196F3',
        //         routeActiveStrokeWidth: 2,
        //         routeStrokeWidth: 0,
        //         wayPointVisible: false,
        //       },
        //     )
        //     mapObjectsStore.addObject(
        //       EMapObjectsType.activeTrack,
        //       multiRoute,
        //       map,
        //     )
        //   }
      }

      initializeMap()

      // Очистка при размонтировании
      return () => {
        if (pointsCollection) {
          map.geoObjects.remove(pointsCollection)
        }
        if (geolocationControl) {
          map.controls.remove(geolocationControl)
        }
        navigationStore.stopNavigation()
      }
    }
  }, [map, track, ymaps])

  return <NavigationContainer />
})

export const TrackOnMap = withYMaps(Track, true, [
  'multiRouter.MultiRoute',
  'GeoObjectCollection',
  'Placemark',
  'control.GeolocationControl',
  'geolocation',
])
