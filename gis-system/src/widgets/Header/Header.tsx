import { Layout, Menu, Typography } from 'antd'
import type { FC } from 'react'

import Icon from '@/shared/ui/Icon'

const Header: FC = () => {
  return (
    <Layout.Header className="flex justify-between items-center leading-none px-2 overflow-hidden bg-[#1A1A1A] border-b border-white">
      <div className="flex items-center">
        <Icon
          name="s-logo2"
          className="w-[54px] h-[32px] align-middle fill-white"
        />
        <Typography.Title level={3} className="m-0 text-white">
          НИРКО
        </Typography.Title>
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        className="flex justify-end bg-transparent spaceHeader"
        items={[
          { key: 1, label: 'Главная' },
          { key: 2, label: 'ГИС' },
        ]}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Layout.Header>
  )
}

export default Header
