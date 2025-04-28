import { Select } from 'antd'
import { observer } from 'mobx-react-lite'
import type { FC } from 'react'
import { useEffect, useState } from 'react'
import type { YMapsApi } from '@pbe/react-yandex-maps/typings/util/typing'
import type { ObjectManager } from 'yandex-maps'

// eslint-disable-next-line boundaries/element-types
import type { IMapFeature } from '@/entities/map'
import { useYandexMap } from '@/shared'
import { EMapObjectsType, mapObjectsStore } from '@/shared'
import { searchSpaceObjects } from '@/shared/api/services/map'

import { searchStore } from '../models/store/searchStore'

interface SearchInputProps {
  ymaps?: YMapsApi & { RemoteObjectManager: typeof ObjectManager }
}

export const SearchInput: FC<SearchInputProps> = observer(() => {
  const map = useYandexMap()
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  )
  const { setSearchQuery, setSearchResults, setSearching, setSelectedResult } =
    searchStore

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTimeout])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setSearching(true)

    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(async () => {
      try {
        const data = await searchSpaceObjects(value)

        if (data.features && data.features.length > 0) {
          setSearchResults(data.features)

          // Получаем RemoteObjectManager из store
          const objectManager = mapObjectsStore.objects.get(
            EMapObjectsType.objectManager,
          ) as ObjectManager

          if (objectManager) {
            // Добавляем результаты поиска в RemoteObjectManager
            objectManager.objects.add(
              data.features.map((feature: IMapFeature) => ({
                type: 'Feature',
                id: feature.id,
                geometry: {
                  type: 'Point',
                  coordinates: [feature.geo.longitude, feature.geo.latitude],
                },
                properties: feature,
              })),
            )
          }
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error('Ошибка поиска:', error)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 500)

    setSearchTimeout(timeout)
  }

  const handleSelect = (value: string) => {
    const selectedFeature = searchStore.searchResults.find(
      (result) => result.id.toString() === value,
    )

    if (selectedFeature && map) {
      setSelectedResult(selectedFeature)
      // Центрируем карту на выбранном объекте
      map.setCenter(
        [selectedFeature.geo.longitude, selectedFeature.geo.latitude],
        15,
      )
    }
  }

  return (
    <Select
      showSearch
      placeholder="Поиск космических объектов"
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleSelect}
      notFoundContent={
        searchStore.isSearching ? 'Поиск...' : 'Ничего не найдено'
      }
      options={searchStore.searchResults.map((result) => ({
        value: result.id.toString(),
        label: result.title,
      }))}
      className="absolute top-4 left-4 z-10 w-64"
    />
  )
})
