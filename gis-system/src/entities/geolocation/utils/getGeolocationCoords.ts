import { geolocationStore } from './geolocationStore'

export const getGeolocationCoords = async (): Promise<
  [number, number] | null
> => {
  const geolocation = geolocationStore.geolocation
  if (!geolocation) {
    console.log('getGeolocationCoords->geolocation is null')
    return null
  }

  try {
    // Сначала пробуем получить координаты через браузер
    const browserCoords = await new Promise<[number, number] | null>(
      (resolve) => {
        navigator.geolocation.getCurrentPosition(
          (geo) => {
            if (geo.coords.longitude && geo.coords.latitude) {
              console.log('getGeolocationCoords->browser coords success')
              return resolve([geo.coords.longitude, geo.coords.latitude])
            }
            console.log('getGeolocationCoords->invalid browser coords')
            return resolve(null)
          },
          (error) => {
            console.error('getGeolocationCoords->browser error', error)
            return resolve(null)
          },
          {
            maximumAge: Infinity,
            timeout: 5000,
            enableHighAccuracy: true,
          },
        )
      },
    )

    if (browserCoords) {
      return browserCoords
    }

    // Если не получилось через браузер, пробуем через API Яндекс Карт
    const result = await geolocation.get({
      provider: 'browser',
      autoReverseGeocode: false,
      timeout: 5000,
    })

    console.log('getGeolocationCoords->result', result)

    if (!result.geoObjects.get(0)) {
      console.log('getGeolocationCoords->no geoObjects')
      return null
    }

    const coords = result.geoObjects.get(0).geometry.getCoordinates()
    if (!coords || coords.length !== 2) {
      console.log('getGeolocationCoords->invalid coords', coords)
      return null
    }

    return coords
  } catch (e) {
    console.error('getGeolocationCoords->error', e)
    return null
  }
}
