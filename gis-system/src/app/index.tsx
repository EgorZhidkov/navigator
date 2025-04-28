import { Suspense } from 'react'

import './styles/theme.scss'

import { LeftSideBar } from '@/widgets'
import { AppRouter } from '@/processes'
import { Header } from '@/widgets'
import { MainLayout } from '@/Layouts'

import withProviders from './providers'

const App = () => {
  return (
    <Suspense fallback="">
      <MainLayout
        header={<Header />}
        content={<AppRouter />}
        sidebar={<LeftSideBar />}
        toolbar={undefined}
      />
    </Suspense>
  )
}

export default withProviders(App)
