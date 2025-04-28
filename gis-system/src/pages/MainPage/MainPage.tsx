import clsx from 'clsx'
import { memo, useEffect } from 'react'
import { Navigate } from 'react-router-dom'

import { getRouteGis } from '@/shared/lib'
import { Content } from 'antd/es/layout/layout'

interface MainPageProps {
  className?: string
}

export const MainPage = memo((props: MainPageProps) => {
  const { className } = props

  return (
    <div className={clsx(className)}>
      <div>asdasd</div>
    </div>
  )
})
