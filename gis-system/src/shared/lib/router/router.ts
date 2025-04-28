export const AppRoutes = {
  ROOT: '/',
  MAIN: 'main',
  GIS: 'gis',
  NOT_FOUND: '404',
} as const

export type TAppRoutes = TValueOf<typeof AppRoutes>
export type TAppRoutesKeys = TValueOf<typeof AppRoutes>

export const getRouteRoot = () => '/'
export const getRouteMain = () => `${AppRoutes.MAIN}`
export const getRouteGis = () => `/${AppRoutes.GIS}`
export const getRouteNotFound = () => `/${AppRoutes.NOT_FOUND}`

export const AppRouteByPathPattern: Record<string, TAppRoutes> = {
  [getRouteMain()]: AppRoutes.MAIN,
  [getRouteNotFound()]: AppRoutes.NOT_FOUND,
  [getRouteRoot()]: AppRoutes.ROOT,
  [getRouteGis()]: AppRoutes.GIS,
}
