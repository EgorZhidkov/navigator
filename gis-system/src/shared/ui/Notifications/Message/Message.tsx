import type { ToastOptions } from 'react-toastify'
import { toast } from 'react-toastify'

import Icon from '@shared/ui/Icon/Icon'

import { Notification } from '../components/Notification/Notification'

interface IMessageProps extends ToastOptions {
  title: string
  description: string
  icon: string
}
export const message = ({
  title,
  description,
  icon,
  ...props
}: IMessageProps) => {
  toast(<Notification title={title} description={description} />, {
    containerId: 'notification-container',
    icon: <Icon className="w-[32px] h-[32px] align-middle" name={icon} />,
    position: 'top-center',
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: 'light',
    type: 'error',
    ...props,
  })
  toast.clearWaitingQueue({ containerId: 'notification-container' })
}
