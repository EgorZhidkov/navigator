import type { ErrorInfo, ReactNode } from 'react'
import React from 'react'

import { ErrorPage } from '@/pages/ErrorPage'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface IErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  IErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log(error, errorInfo)
  }

  render() {
    const { hasError } = this.state
    const { children } = this.props

    if (hasError) {
      return <ErrorPage code={404} />
    }

    return children
  }
}

const withErrorBoundary = (component: () => React.ReactNode) =>
  function withErrorBoundaryProvider() {
    return <ErrorBoundary>{component()}</ErrorBoundary>
  }

export default withErrorBoundary
