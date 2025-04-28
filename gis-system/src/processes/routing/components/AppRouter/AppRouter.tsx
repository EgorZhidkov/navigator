import type { ReactElement } from 'react'
import { memo, Suspense, useCallback } from 'react'
import type { RouteProps } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import { Spin } from 'antd'

import { routeConfig } from '../../config'

const AppRouter = () => {
  const routs = Object.values(routeConfig)

  const renderWithWrapper = useCallback((route: RouteProps): ReactElement => {
    const element = <Suspense fallback={<Spin />}>{route.element}</Suspense>

    return <Route key={route.path} path={route.path} element={element} />
  }, [])

  // @ts-ignore
  return <Routes>{routs.map(renderWithWrapper)}</Routes>
}

export default memo(AppRouter)
