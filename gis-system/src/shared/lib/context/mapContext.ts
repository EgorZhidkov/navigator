import type { Context } from 'react'
import { createContext, useContext } from 'react'

import type { IMapState } from '../../@types'

export const MapContext: Context<IMapState> = createContext<IMapState>({
  mapTheme: 'default',
})
export const useMapContext = (): IMapState => useContext(MapContext)
