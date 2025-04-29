import { checkIsGeolocationGranted } from './checkIsGeolocationGranted'
import { getGeolocationCoords } from './getGeolocationCoords'
import { geolocationStore } from './geolocationStore'

export default async function getGeolocation(
  map: ymaps.Map | null,
): Promise<[number, number] | undefined> {
  try {
    const isGeolocationGranted = await checkIsGeolocationGranted()
    console.log('getGeolocation->isGeolocationGranted', isGeolocationGranted)

    if (!isGeolocationGranted) {
      console.log('getGeolocation->geolocation not granted')
      return undefined
    }

    const coords = await getGeolocationCoords()
    console.log('getGeolocation->coords', coords)

    if (!coords) {
      console.log('getGeolocation->no coords')
      return undefined
    }

    if (map) {
      try {
        await map.setCenter(coords, undefined, {
          duration: 200,
        })
        console.log('getGeolocation->map center set')
      } catch (e) {
        console.error('getGeolocation->error setting map center', e)
      }
    }

    geolocationStore.setFinished(coords)
    geolocationStore.setGeolocationPosition(coords)
    return coords
  } catch (e) {
    console.error('getGeolocation->error', e)
    return undefined
  }
}
