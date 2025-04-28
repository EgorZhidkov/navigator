import { Layout, Spin } from 'antd/es'
import clsx from 'clsx'
import type { FC } from 'react'
import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'

import type { TErrorCodes } from './model/@types'
import { SERVER_ERRORS } from './const'

interface IErrorPageProps {
  code?: TErrorCodes
  mode?: 'fullscreen' | 'page'
}
export const ErrorPage: FC<IErrorPageProps> = ({ code, mode = 'page' }) => {
  const location = useLocation()
  const errorCode = String(
    code ||
      (location.state && location.state.error
        ? location.state.error
        : SERVER_ERRORS.NOT_FOUND),
  )
  const Error = lazy(
    () => import(`./components//Error${errorCode}/Error${errorCode}.tsx`),
  )
  return (
    <Layout
      className={clsx(
        mode === 'fullscreen' ? 'app-error-page_fullscreen' : '',
        'app-error-page',
      )}
    >
      <Suspense fallback={<Spin />}>
        <Error />
      </Suspense>
    </Layout>
  )
}
