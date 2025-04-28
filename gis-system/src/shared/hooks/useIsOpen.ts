import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useState } from 'react'

interface IResult {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  handleClose: () => void
  handleOpen: () => void
}

export const useIsOpen = (
  initialState?: boolean,
  onClose?: () => void,
): IResult => {
  const [isOpen, setIsOpen] = useState(Boolean(initialState))

  const handleClose = useCallback((): void => {
    if (onClose) {
      onClose()
    }
    setIsOpen(false)
  }, [onClose])

  const handleOpen = useCallback((): void => {
    setIsOpen(true)
  }, [])

  return {
    isOpen,
    setIsOpen,
    handleClose,
    handleOpen,
  }
}
