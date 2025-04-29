import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect } from 'react'
import { checkIsGeolocationGranted } from '../utils/checkIsGeolocationGranted'
import { getGeolocationCoords } from '../utils/getGeolocationCoords'
import { geolocationStore } from '../utils/geolocationStore'
import { useYandexMap } from '@/shared'
import { Placemark } from '@pbe/react-yandex-maps'
import geolocationIcon from '@/shared/assets/images/geolocationIcon.svg'

export const GeolocationPlacemark: FC = observer(() => {
  const map = useYandexMap()
  const setPositionToGeolocation = useCallback(() => {
    checkIsGeolocationGranted().then((isGeolocationGranted) => {
      if (isGeolocationGranted) {
        getGeolocationCoords()
          .then((coords) => {
            geolocationStore.setGeolocationPosition(coords)
          })
          .catch((e) => console.log(e))
      }
    })

    return
  }, [])

  useEffect(() => {
    setPositionToGeolocation()
  }, [setPositionToGeolocation])

  useEffect(() => {
    checkIsGeolocationGranted().then((isGeolocationGranted) => {
      if (isGeolocationGranted) {
        getGeolocationCoords().then((coords) => {
          if (coords) {
            map
              ?.setCenter(coords, undefined, {
                duration: 200,
                timingFunction: 'ease-out',
              })
              .then(() => {})
            setPositionToGeolocation()
          }
        })
      }
    })
  }, [])

  if (!geolocationStore.geolocationPosition || !map) {
    return null
  }

  return (
    <Placemark
      geometry={geolocationStore.geolocationPosition}
      options={{
        iconLayout: 'default#image',
        iconImageHref: geolocationIcon,
        cursor: 'pointer',
        iconImageSize: [44, 44],
        iconImageOffset: [-22, -22],
      }}
    />
  )
})
