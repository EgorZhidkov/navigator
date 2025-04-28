import type { ModalProps } from 'antd'
import { Modal as AntdModal } from 'antd'
import type { FC } from 'react'

interface IModalProps extends ModalProps {}

export const Modal: FC<IModalProps> = ({ ...props }) => {
  return <AntdModal {...props} className="app-modal" />
}
