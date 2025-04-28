import type { ItemType, MenuItemType } from 'antd/es/menu/interface'

import { mapFiltersStore, trackStore } from '@/entities'

export const gisMenu: ItemType<MenuItemType>[] = [
  {
    label: 'Маршруты',
    key: '1',
    onClick: () => trackStore.toggleTrackWindow(),
  },
  {
    label: 'Создать свой маршрут',
    key: '2',
    onClick: () => trackStore.toggleCustomTrackWindow(),
  },
  {
    label: 'Фильтры',
    key: '3',
    onClick: () => mapFiltersStore.toggleFiltersWindow(),
  },
]
