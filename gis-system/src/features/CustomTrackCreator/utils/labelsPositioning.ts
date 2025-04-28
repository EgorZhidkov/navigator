/**
 * Проверяет пересечение двух прямоугольников
 */
export const doRectsOverlap = (rect1: DOMRect, rect2: DOMRect): boolean => {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  )
}

/**
 * Корректирует позиции меток для предотвращения наложения
 */
export const adjustLabelsPosition = (labels: NodeListOf<Element>): void => {
  if (labels.length <= 1) return

  const positions: Array<{ el: Element; rect: DOMRect; moved: boolean }> = []

  // Собираем информацию о позициях всех меток
  labels.forEach((label) => {
    positions.push({
      el: label,
      rect: label.getBoundingClientRect(),
      moved: false,
    })
  })

  // Сортируем метки по высоте для более предсказуемого размещения
  positions.sort((a, b) => a.rect.top - b.rect.top)

  // Корректируем позиции при наложении, используя более сложный алгоритм
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i]

    for (let j = 0; j < positions.length; j++) {
      if (i === j) continue

      const other = positions[j]

      if (doRectsOverlap(current.rect, other.rect)) {
        const element = current.el as HTMLElement

        // Если текущий элемент ниже, смещаем его вверх, иначе вниз
        // Это помогает избежать циклических смещений, когда все метки смещаются в одном направлении
        const direction = current.rect.top > other.rect.top ? -1 : 1
        const offset = Math.max(current.rect.height, other.rect.height)

        // Применяем смещение, используя в первую очередь translate для лучшей производительности
        const currentTransform = window.getComputedStyle(element).transform
        const matrix = new DOMMatrix(
          currentTransform === 'none' ? '' : currentTransform,
        )

        // Получаем текущее смещение по Y (если оно есть) и добавляем новое смещение
        const currentY = matrix.m42
        const newY = currentY + direction * offset

        element.style.transform = `translateY(${newY}px)`
        element.style.zIndex = (1000 + i).toString() // Увеличиваем z-index для смещенных элементов

        // Обновляем информацию о позиции после смещения
        current.rect = element.getBoundingClientRect()
        current.moved = true

        // Перезапускаем проверку для текущего элемента, так как его позиция изменилась
        j = -1 // При следующей итерации j станет 0
      }
    }
  }

  // Добавляем небольшую полупрозрачную подложку под метки для лучшей читаемости
  positions.forEach((pos) => {
    if (pos.moved) {
      const element = pos.el as HTMLElement
      element.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'
      element.style.padding = '2px 4px'
      element.style.borderRadius = '3px'
      element.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)'
    }
  })
}
