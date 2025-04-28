import type { FC } from 'react'
import { YMaps } from '@pbe/react-yandex-maps'

type TMapProps = {
  children: JSX.Element | JSX.Element[]
}
export const YandexMapLayout: FC<TMapProps> = ({ children }) => (
  <YMaps
    query={{
      apikey: '57a77da8-4524-4a36-972c-a88212a947c1&lang=ru_RU',
      coordorder: 'longlat',
    }}
  >
    {children}
  </YMaps>
)
