import type { IMapFilter } from '../models/@types'

export const mapFiltersConfig: IMapFilter[] = [
  {
    id: 'objectType',
    type: 'checkbox',
    label: 'Тип объекта',
    options: [
      { value: 'museum', label: 'Музей' },
      { value: 'factory', label: 'Завод' },
      { value: 'research', label: 'НИИ' },
      { value: 'residence', label: 'Место проживания' },
      { value: 'cosmodrome', label: 'Космодром' },
    ],
  },
  {
    id: 'status',
    type: 'radio',
    label: 'Статус',
    options: [
      { value: 'working', label: 'Работающие' },
      { value: 'closed', label: 'Закрытые' },
    ],
  },
  {
    id: 'year',
    type: 'range',
    label: 'Год',
    range: {
      min: 1900,
      max: 2024,
      step: 1,
    },
  },
]
