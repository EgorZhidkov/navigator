import type { FC } from 'react'
import { memo, useCallback } from 'react'
import { Button, Steps } from 'antd'

import { INSTRUCTIONS } from '../model/const'

interface InstructionStepProps {
  onNext: () => void
}

export const InstructionStep: FC<InstructionStepProps> = memo(({ onNext }) => {
  const handleNext = useCallback(() => {
    onNext()
  }, [onNext])

  return (
    <div className="p-8">
      <Steps
        direction="vertical"
        items={INSTRUCTIONS.map((item) => ({
          title: item.title,
          description: item.description,
          status: 'process',
        }))}
      />
      <div className="mt-8 text-center">
        <Button type="primary" onClick={handleNext}>
          Начать создание маршрута
        </Button>
      </div>
    </div>
  )
})

InstructionStep.displayName = 'InstructionStep'
