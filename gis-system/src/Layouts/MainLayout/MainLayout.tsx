import Layout from 'antd/es/layout'
import clsx from 'clsx'
import type { ReactElement } from 'react'
import { memo, useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { routeConfig } from '@processes/routing'
import { getRouteMain } from '@shared/lib/router'

interface IMainLayoutProps {
  className?: string
  header?: ReactElement
  content?: ReactElement
  sidebar?: ReactElement
  toolbar?: ReactElement
}

export const MainLayout = memo<IMainLayoutProps>(
  ({ className, content, header, sidebar }) => {
    const { pathname } = useLocation()

    const showHeaderAndSideBar = useMemo<boolean>(() => {
      let show = true
      if (
        pathname !== getRouteMain() &&
        !Object.prototype.hasOwnProperty.call(routeConfig, pathname.slice(1))
      ) {
        show = false
      }
      return show
    }, [pathname])

    return (
      <Layout className={clsx(className, 'layout bg-[#1A1A1A]')}>
        {showHeaderAndSideBar && header}
        <Layout
          className="layout bg-transparent pl-2 pr-8 pb-8 pt-8 flex gap-3"
          hasSider
        >
          {showHeaderAndSideBar && sidebar}

          <Layout className="bg-[#1A1A1A] border-transparent border-2 rounded-lg">
            {content}
          </Layout>
        </Layout>
      </Layout>
    )
  },
)
