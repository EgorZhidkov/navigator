import { useState, useCallback } from 'react'
import type { FC } from 'react'
import { observer } from 'mobx-react-lite'

import { Modal } from '@/shared/ui'
import { trackStore } from '@/entities'

import type { CustomTrackStep } from '../model/types'

import { CustomTrackMap } from './CustomTrackMap'
import { InstructionStep } from './InstructionStep'

export const CustomTrackModal: FC = observer(() => {
  const { isCustomTrackModalOpen, toggleCustomTrackWindow } = trackStore
  const [step, setStep] = useState<CustomTrackStep>('instruction')

  const handleClose = useCallback(() => {
    toggleCustomTrackWindow()
    // Сбрасываем шаг на инструкцию при закрытии
    setStep('instruction')
  }, [toggleCustomTrackWindow])

  const handleNextStep = useCallback(() => {
    setStep('creation')
  }, [])

  return (
    <Modal
      title="Создание маршрута"
      open={isCustomTrackModalOpen}
      onCancel={handleClose}
      width={1000}
      footer={null}
    >
      {step === 'instruction' ? (
        <InstructionStep onNext={handleNextStep} />
      ) : (
        <CustomTrackMap onClose={handleClose} />
      )}
    </Modal>
  )
})
