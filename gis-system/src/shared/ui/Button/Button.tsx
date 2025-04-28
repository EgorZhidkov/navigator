import type { FC } from 'react'
import type { ButtonProps } from 'antd'
import { Button as AntButton } from 'antd'

interface IButton extends ButtonProps {}

export const Button: FC<IButton> = ({ ...props }) => {
  return <AntButton {...props} />
}
