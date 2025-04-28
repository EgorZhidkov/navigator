import type { ItemType, MenuItemType } from 'antd/es/menu/interface'
import type { NavigateFunction } from 'react-router-dom'

import type { TAppRoutes } from '@/shared/lib'

import { gisMenu } from './gisMenu'

// TODO: вынести как нибудь в lib
export const menu = (
  navigate: NavigateFunction,
): Record<Partial<TAppRoutes>, ItemType<MenuItemType>[]> => {
  return {
    gis: gisMenu,
    '404': [],
    main: [
      { label: 'Навигатор', key: '1', onClick: () => navigate('/gis') },
      { label: 'Энциклопедия', key: '2' },
      { label: 'Музеи', key: '3' },
    ],
    '/': [],
  }
}
