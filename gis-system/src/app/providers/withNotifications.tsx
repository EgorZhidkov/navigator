import { NotificationsContainer } from '@shared/ui/Notifications'

const withNotifications = (component: () => React.ReactNode) =>
  function withNotificationsProvider() {
    return (
      <>
        {component()}
        <NotificationsContainer />
      </>
    )
  }

export default withNotifications
