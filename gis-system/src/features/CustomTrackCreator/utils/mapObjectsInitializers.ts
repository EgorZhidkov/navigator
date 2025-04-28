import type { YMapsApi } from '@pbe/react-yandex-maps/typings/util/typing'

import { EMapObjectsType, mapObjectsStore } from '@/shared'

import { REMOTE_OBJECT_MANAGER_OPTIONS } from '../model/const'

import { adjustLabelsPosition } from './labelsPositioning'

/**
 * Обрезает длинные названия объектов для отображения на метке
 */
const truncateObjectName = (name: string, maxLength = 20): string => {
  if (!name) return 'Объект'
  return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name
}

// Счетчик для создания уникальных смещений меток
let offsetCounter = 0
const MAX_OFFSETS = 5

/**
 * Инициализирует RemoteObjectManager для отображения объектов на карте
 * @returns Экземпляр RemoteObjectManager для управления объектами
 */
export const initializeObjectManager = (
  ymaps: YMapsApi,
  map: ymaps.Map,
): unknown => {
  // @ts-ignore - Игнорируем ошибку типа, так как RemoteObjectManager не описан в типах
  const remoteObjectManager = new ymaps.RemoteObjectManager(
    `http://localhost:8090/api/v1/maps/get-elements?bbox=%b&zoom=%z`,
    {
      ...REMOTE_OBJECT_MANAGER_OPTIONS,
      // Базовые настройки для объектов
      clusterize: true,
      gridSize: 64,
      geoObjectOpenBalloonOnClick: false,
    },
  )

  // Перехватываем события добавления объектов для настройки их отображения
  remoteObjectManager.objects.events.add(
    'add',
    (event: { get: (key: string) => string }) => {
      const objectId = event.get('objectId')
      if (objectId) {
        // Распределяем смещения меток для предотвращения наложения
        offsetCounter = (offsetCounter + 1) % MAX_OFFSETS
        const yOffset = -15 - offsetCounter * 5

        // Устанавливаем индивидуальные опции для каждого объекта
        remoteObjectManager.objects.setObjectOptions(objectId, {
          preset: 'islands#blackStretchyIcon',
          iconContentLayout: ymaps.templateLayoutFactory.createClass(
            '<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">{{ properties.title }}</span>',
          ),
          balloonContentLayout: ymaps.templateLayoutFactory.createClass(
            '<div class="custom-balloon">{{ properties.title }}</div>',
          ),
          cursor: 'pointer',
          iconShape: {
            type: 'Circle',
            coordinates: [0, yOffset],
            radius: 15,
            zIndex: 652 + offsetCounter, // Увеличиваем z-index для каждой последующей метки
          },
          // Добавляем смещение для меток по вертикали
          iconOffset: [0, yOffset],
          // Устанавливаем приоритет отображения
          overlayFactory: 'default#interactiveGraphics',
          zIndexHover: 900,
        })

        // Получаем информацию об объекте
        const objectData = remoteObjectManager.objects.getById(objectId)
        if (
          objectData &&
          objectData.properties &&
          objectData.properties.title
        ) {
          // Обрезаем длинное название если нужно
          if (objectData.properties.title.length > 20) {
            objectData.properties.title = truncateObjectName(
              objectData.properties.title,
            )
          }
        }
      }
    },
  )

  // Обрабатываем изменение масштаба для корректировки меток
  map.events.add('boundschange', () => {
    // Сбрасываем счетчик смещения при изменении масштаба
    offsetCounter = 0

    setTimeout(() => {
      const labels = document.querySelectorAll(
        '.ymaps-2-1-79-stretched-texts-wrapper span',
      )
      if (labels.length > 0) {
        adjustLabelsPosition(labels)
      }
    }, 200) // Увеличиваем задержку для анимации
  })

  // Добавляем стили для предотвращения наложения меток
  const styleElement = document.createElement('style')
  styleElement.textContent = `
    .ymaps-2-1-79-stretched-texts-wrapper span {
      display: block;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    /* Создаем небольшой фон для лучшей читаемости текста */
    .ymaps-2-1-79-icon-caption {
      background-color: rgba(255, 255, 255, 0.7);
      padding: 2px 4px;
      border-radius: 3px;
    }
    
    /* Стиль для всплывающей подсказки */
    .custom-balloon {
      padding: 8px 12px;
      font-weight: bold;
    }
  `
  document.head.appendChild(styleElement)

  mapObjectsStore.addObject(
    EMapObjectsType.customTrackObjectManager,
    remoteObjectManager,
    map,
  )

  // Возвращаем экземпляр менеджера объектов для дальнейшего использования
  return remoteObjectManager
}

/**
 * Инициализирует элементы управления на карте
 */
export const initializeMapControls = (map: ymaps.Map): void => {
  // Добавляем элементы управления масштабом
  map.controls.add('zoomControl', {
    float: 'right',
  })

  // Добавляем возможность перемещаться по карте
  map.behaviors.enable(['drag', 'scrollZoom', 'multiTouch'])
}
