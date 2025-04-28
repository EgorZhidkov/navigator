import { Divider, Layout, Typography } from 'antd/es'
import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { getRouteMain } from '@shared/lib/router/router'

const Error404: FC = () => {
  const navigate = useNavigate()
  const goBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    navigate(-1)
  }
  return (
    <>
      <Layout className="error-404-page flex bg-transparent justify-center items-center">
        <div className="w-[550px]">
          <Typography.Title level={3} className="mx-4 my-0 text-white">
            404 Страница не найдена
          </Typography.Title>
          <a onClick={goBack} className="ml-5" href={getRouteMain()}>
            Назад
          </a>
          <Divider className="border-gray-500 my-4" />
        </div>
      </Layout>
    </>
  )
}

export default Error404
