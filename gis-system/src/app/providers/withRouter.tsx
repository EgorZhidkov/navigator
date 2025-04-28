import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'

const withRouter = (component: () => ReactNode) =>
  function withRouterProvider() {
    return <BrowserRouter>{component()}</BrowserRouter>
  }

export default withRouter
