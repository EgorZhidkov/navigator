import { useState, useRef, useCallback } from 'react'

export const useDragAndDrop = <T>(initialItems: T[]) => {
  const [items, setItems] = useState<T[]>(initialItems)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const ghostElement = useRef<HTMLDivElement | null>(null)

  const handleSort = useCallback(() => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const copiedItems = [...items]
      const [draggedItem] = copiedItems.splice(dragItem.current, 1)
      copiedItems.splice(dragOverItem.current, 0, draggedItem)
      setItems(copiedItems)
      dragItem.current = null
      dragOverItem.current = null
    }
  }, [items])

  const getDragProps = (index: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
      dragItem.current = index
      setDragging(true)

      // Создаем кастомный drag-образ
      const element = e.currentTarget
      const ghost = element.cloneNode(true) as HTMLElement
      ghost.style.position = 'absolute'
      ghost.style.top = '-9999px'
      ghost.style.transform = 'scale(1.05)'
      ghost.style.opacity = '0.8'
      ghost.style.zIndex = '1000'
      ghost.style.pointerEvents = 'none'
      document.body.appendChild(ghost)

      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(ghost, 0, 0)
        ghostElement.current = ghost
      }
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      dragOverItem.current = index
    },
    onDragEnd: () => {
      setDragging(false)
      handleSort()
      if (ghostElement.current) {
        document.body.removeChild(ghostElement.current)
      }
    },
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault()
      if (dragItem.current !== index) {
        dragOverItem.current = index
      }
    },
  })

  return {
    items,
    setItems,
    getDragProps,
    dragging,
    dragIndex: dragItem.current,
    overIndex: dragOverItem.current,
  }
}
