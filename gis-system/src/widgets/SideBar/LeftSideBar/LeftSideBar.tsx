import { Button, Layout, Menu } from 'antd'
import { useState, type FC } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'

import type { TAppRoutes } from '@/shared/lib'

import { menu } from './const'

const SIDER_SIZE = 200

export const LeftSideBar: FC = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [, pagePath] = pathname.split('/')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      <Layout.Sider
        width={SIDER_SIZE}
        collapsible
        collapsed={collapsed}
        data-testid="sidebar"
        className="bg-transparent app-sider"
        trigger={null}
      >
        <div className="menu flex flex-col h-full items-start justify-center">
          <Menu
            rootClassName="app-sider-menu__items"
            className="bg-transparent w-full"
            selectedKeys={[]}
            mode="vertical"
            items={menu(navigate)[pagePath as TAppRoutes]}
            style={{ flex: 1, minWidth: 0, width: '100%' }}
          />
          <Button
            onClick={() => setCollapsed((prev) => !prev)}
            className="border-0 bg-inherit shadow-none w-full hover:bg-slate-500 focus:outline-none"
          >
            <LeftOutlined />
          </Button>
        </div>
      </Layout.Sider>
    </>
  )
}
