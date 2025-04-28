import { observer } from 'mobx-react-lite'

import { trackStore } from '../models/store/trackStore'

import { Navigation } from './Navigation'
import { UserLocation } from './UserLocation'

export const NavigationContainer = observer(() => {
  const { track } = trackStore

  console.log(track)

  if (!track) return null

  return (
    <>
      <UserLocation />
      {/* <Navigation /> */}
    </>
  )
})
