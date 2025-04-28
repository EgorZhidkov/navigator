import type { IPlace } from '../@types'

export const PLACES_MOCK: IPlace[] = [
  {
    id: '1',
    name: 'Place 1',
    coordinates: [37.618423, 55.751244],
    description: 'Description of Place 1',
    photos: [
      // eslint-disable-next-line sonarjs/no-duplicate-string
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
    ],
  },
  {
    id: '2',
    name: 'Place 2',
    coordinates: [37.628423, 55.761244],
    description: 'Description of Place 2',
    photos: [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
    ],
  },
  {
    id: '3',
    name: 'Place 3',
    coordinates: [37.638423, 55.771244],
    description: 'Description of Place 3',
    photos: [
      'https://via.placeholder.com/150',
      'https://via.placeholder.com/150',
    ],
  },
]
