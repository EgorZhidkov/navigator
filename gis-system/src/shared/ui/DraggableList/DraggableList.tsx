import { useEffect } from 'react'

import { useDragAndDrop } from '@/shared/hooks'

interface DraggableListProps<T> {
  items: T[]
  renderItem: (
    item: T,
    index: number,
    dragProps: React.HTMLAttributes<HTMLDivElement>,
  ) => React.ReactNode
  className?: string
  itemClassName?: string
  onItemsChange?: (newItems: T[]) => void
}

export const DraggableList = <T,>({
  items: initialItems,
  renderItem,
  className,
  itemClassName,
  onItemsChange,
}: DraggableListProps<T>) => {
  const { items, getDragProps, dragging, dragIndex, overIndex } =
    useDragAndDrop(initialItems)

  useEffect(() => {
    onItemsChange?.(items)
  }, [items, onItemsChange])

  return (
    <div
      className={`
      min-h-[200px] p-4 border-2 border-gray-300 rounded-md
      ${className || ''}
      relative
    `}
    >
      {items.map((item, index) => {
        const isDragging = dragging && index === dragIndex
        const isOver = index === overIndex

        return (
          <div
            key={index}
            className={`
              relative transition-all duration-300
              ${
                isDragging
                  ? 'z-50 scale-[1.02] shadow-2xl border-2 border-blue-500'
                  : 'z-10'
              }
              ${dragging && !isDragging ? 'opacity-50' : ''}
              ${isOver ? 'bg-blue-50 border-blue-200' : ''}
              ${itemClassName || ''}
            `}
            style={{
              transform: isDragging
                ? `translateY(${overIndex! > dragIndex! ? '20px' : '-20px'})`
                : 'translateY(0)',
              transition: 'transform 0.3s',
              position: isDragging ? 'relative' : 'static',
            }}
            {...getDragProps(index)}
          >
            {renderItem(item, index, {
              className: `
                cursor-move w-full
                transition-transform duration-300
                ${isDragging ? 'opacity-100' : ''}
              `,
            })}
          </div>
        )
      })}
    </div>
  )
}
