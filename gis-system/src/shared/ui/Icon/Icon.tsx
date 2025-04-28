import clsx from 'clsx'
import type { FC } from 'react'
import { memo } from 'react'

import { useDynamicSvgImport } from '@/shared/hooks'

interface IIconProps extends React.SVGProps<SVGSVGElement> {
  name: string
  additionClassName?: string
  size?: string
}

const Icon: FC<IIconProps> = ({
  name,
  additionClassName = '',
  size,
  ...props
}): JSX.Element | null => {
  const [SvgIcon, , ico] = useDynamicSvgImport(name)
  if (ico && typeof SvgIcon === 'function') {
    return (
      <figure
        style={size ? { fontSize: size } : undefined}
        className={clsx('app-icon inline-block m-0 p-0', additionClassName)}
      >
        <SvgIcon {...props} />
      </figure>
    )
  }
  return null
}

export default memo(Icon)
