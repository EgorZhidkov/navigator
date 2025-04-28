import type { Map as OLMap, View as OLView } from 'ol'

import type { MapThemeTypes } from './IMapTheme'

export interface IMapState {
  map?: OLMap
  view?: OLView
  mapTheme?: MapThemeTypes
}
