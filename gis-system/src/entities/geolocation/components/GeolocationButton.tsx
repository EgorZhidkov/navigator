import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect } from 'react'
import { geolocationStore } from '../utils/geolocationStore'
import { checkIsGeolocationGranted } from '../utils/checkIsGeolocationGranted'
import { getGeolocationCoords } from '../utils/getGeolocationCoords'
import { YMapCustomButton } from '@/shared/ui/YMapCurstomButton'
import { template } from './template'

interface IProps {
  bottomContainerHeight: number
}

export const GeolocationButton: FC<IProps> = observer(() => {
  const { map, geolocation } = geolocationStore

  // Инициализация геолокации при монтировании компонента
  useEffect(() => {
    if (map && geolocation) {
      checkIsGeolocationGranted().then((isGeolocationGranted) => {
        if (isGeolocationGranted) {
          getGeolocationCoords().then((coords) => {
            if (coords) {
              map
                .setCenter(coords, undefined, {
                  duration: 200,
                })
                .then(() => {})
              geolocationStore.setGeolocationPosition(coords)
            }
          })
        }
      })
    }
  }, [map, geolocation])

  const handleClick = useCallback(() => {
    console.log('GeolocationButton->click', { geolocation, map })
    if (!map || !geolocation) {
      console.log('GeolocationButton->map or geolocation not initialized')
      return
    }

    checkIsGeolocationGranted().then((isGeolocationGranted) => {
      if (isGeolocationGranted) {
        getGeolocationCoords().then((coords) => {
          if (coords) {
            map
              .setCenter(coords, undefined, {
                duration: 200,
              })
              .then(() => {
                console.log('GeolocationButton->map center set')
              })
              .catch((e) => {
                console.error('GeolocationButton->error setting map center', e)
              })
            geolocationStore.setGeolocationPosition(coords)
          } else {
            console.log('GeolocationButton->no coords received')
          }
        })
      } else {
        console.log('GeolocationButton->geolocation not granted')
      }
    })
  }, [geolocation, map])

  if (!map || !geolocation) {
    console.log(
      'GeolocationButton->not rendering, map or geolocation not initialized',
    )
    return null
  }

  return (
    <YMapCustomButton
      id={'geolocationButton'}
      map={map}
      template={template}
      onClick={handleClick}
      options={{
        position: {
          bottom: 100,
          right: 100,
        },
        selectOnClick: false,
      }}
    />
  )
})
