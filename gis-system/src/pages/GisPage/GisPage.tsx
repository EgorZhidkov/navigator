import clsx from 'clsx'
import type { FC } from 'react'
import { observer } from 'mobx-react-lite'

import {
  FeatureInfoCard,
  FeatureOnMap,
  YandexMap,
  mapFiltersStore,
  trackStore,
  SearchInput,
} from '@/entities'
import { FiltersModal } from '@/features/mapFilters'
import { CustomTrackModal } from '@/features/CustomTrackCreator'
import { TracksModalInfo } from '@/widgets'
import { EMapObjectsType, mapObjectsStore } from '@/shared'
import { NavigationContainer } from '@/entities/track'

interface IGisPage {
  className?: string
}

export const GisPage: FC<IGisPage> = observer(({ className }) => {
  const { objects } = mapObjectsStore
  return (
    <div className={clsx(className, 'flex flex-col relative h-full')}>
      <YandexMap>
        <SearchInput />
        <TracksModalInfo />
        {mapFiltersStore.isFiltersWindowOpen && <FiltersModal />}
        {trackStore.isCustomTrackModalOpen && <CustomTrackModal />}
        {!objects.has(EMapObjectsType.activeTrack) && <FeatureOnMap />}
        <FeatureInfoCard />
        <NavigationContainer />
      </YandexMap>
    </div>
  )
})
