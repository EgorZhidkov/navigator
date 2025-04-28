import { Navigate, type RouteProps } from 'react-router-dom'

import { ErrorPage, MainPage } from '@/pages'
import {
  AppRoutes,
  getRouteGis,
  getRouteMain,
  type TAppRoutes,
} from '@shared/lib'
import { GisPage } from '@/pages'

export const routeConfig: DeepPartial<Record<TAppRoutes, RouteProps>> = {
  [AppRoutes.MAIN]: {
    path: getRouteMain(),
    element: <MainPage />,
  },
  [AppRoutes.GIS]: {
    path: getRouteGis(),
    element: <GisPage />,
  },

  [AppRoutes.NOT_FOUND]: {
    path: '*',
    element: <ErrorPage code={404} />,
  },
  [AppRoutes.ROOT]: {
    path: '/',
    element: <Navigate to={getRouteMain()} replace />,
  },
}
