export const POLYGON_OPTIONS = {
  editorDrawingCursor: 'crosshair',
  editorMaxPoints: 10,
  fillColor: '#00FF0020',
  strokeColor: '#0000FF',
  strokeWidth: 2,
} as const

export const REMOTE_OBJECT_MANAGER_OPTIONS = {
  clusterize: true,
  gridSize: 64,
  geoObjectOpenBalloonOnClick: false,
  geoObjectIconLayout: 'default#image',
  geoObjectIconImageHref:
    'https://cdn-icons-png.flaticon.com/512/3179/3179068.png',
  geoObjectIconImageSize: [32, 32],
  geoObjectIconImageOffset: [-16, -16],
  clusterDisableClickZoom: true,
  clusterOpenBalloonOnClick: false,
  preset: 'islands#redClusterIcons',
} as const

export const INSTRUCTIONS = [
  {
    title: 'Построение области',
    description:
      'Кликайте на карту, чтобы создать область для поиска мест. Используйте колесико мыши для масштабирования карты.',
  },
  {
    title: 'Работа с объектами',
    description:
      'Приближайте карту, чтобы увидеть отдельные объекты вместо кластеров',
  },
  {
    title: 'Редактирование',
    description: 'Вы можете перетаскивать точки для изменения формы области',
  },
  {
    title: 'Создание маршрута',
    description: 'После выбора области нажмите "Создать маршрут"',
  },
] as const
