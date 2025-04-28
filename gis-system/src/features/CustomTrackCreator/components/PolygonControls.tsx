import { memo } from 'react'
import type { FC } from 'react'
import { Button, Space } from 'antd'

interface PolygonControlsProps {
  onFinish: () => void
  onReset: () => void
  disabled?: boolean
}

export const PolygonControls: FC<PolygonControlsProps> = memo(
  ({ onFinish, onReset, disabled = true }) => {
    return (
      <div className="absolute bottom-4 right-4 z-10">
        <Space>
          <Button onClick={onReset}>Сбросить</Button>
          <Button
            className={`disabled:opacity-50 ${disabled ? 'bg-black' : ''}`}
            onClick={onFinish}
            disabled={disabled}
          >
            Создать маршрут
          </Button>
        </Space>
      </div>
    )
  },
)

PolygonControls.displayName = 'PolygonControls'
