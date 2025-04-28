import type { FC } from 'react'
import type { ToastContainerProps } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

import { Portal } from '../../../Portal'

type TNotificationsContainerProps = {
  rootElement?: HTMLElement
} & ToastContainerProps
export const NotificationsContainer: FC<TNotificationsContainerProps> = ({
  rootElement = document.body,
  ...props
}) => (
  <Portal element={rootElement}>
    <ToastContainer
      limit={1}
      containerId={'requestNotificationContainer'}
      toastClassName="notification-container-body"
      className="notification-container z-[1000]"
      {...props}
    />
    <ToastContainer
      limit={1}
      containerId={'notification-container'}
      toastClassName="notification-container-body"
      className="notification-container"
      {...props}
    />
  </Portal>
)
