import { Provider } from 'mobx-react'

import {
  featureYandexMapStore,
  mapFiltersStore,
  mapStore,
  trackStore,
} from '@/entities'
import { mapObjectsStore } from '@/shared'
import { navigationStore } from '@/entities/track'

const stores = {
  mapStore,
  featureYandexMapStore,
  trackStore,
  mapObjectsStore,
  mapFiltersStore,
  navigationStore,
}

const withStore = (component: () => React.ReactNode) =>
  function withStoreProvider() {
    return <Provider {...stores}>{component()}</Provider>
  }

export default withStore
