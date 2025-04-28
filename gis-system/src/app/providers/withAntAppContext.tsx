import { App as AppContext } from 'antd'

const withAntAppContext = (component: () => React.ReactNode) =>
  function withAntAppContextProvider() {
    return (
      <AppContext notification={{ top: 60 }} className="flex p-0 m-0 w-screen">
        {component()}
      </AppContext>
    )
  }

export default withAntAppContext
