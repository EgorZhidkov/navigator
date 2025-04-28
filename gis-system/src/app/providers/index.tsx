import compose from 'compose-function'

import withAntAppContext from './withAntAppContext'
import withAntAppConfig from './withAppConfig'
import withErrorBoundary from './withErrorBoundary'
import withNotifications from './withNotifications'
import withRouter from './withRouter'
import withStore from './withStore'

const withProviders = compose(
  withAntAppConfig,
  withRouter,
  withAntAppContext,
  withErrorBoundary,
  withNotifications,
  withStore,
)
export default withProviders
