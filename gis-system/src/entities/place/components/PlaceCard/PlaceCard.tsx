import React from 'react'

import { Carousel } from '@/shared/ui'

import type { IPlace } from '../../@types'

interface PlaceCardProps {
  place: IPlace
  onOpen: () => void
}
export const PlaceCard: React.FC<PlaceCardProps> = ({
  place: { name, photos, description },
  onOpen,
}) => (
  <div onClick={onOpen}>
    <h3>{name}</h3>
    <Carousel photos={photos} />
    <p>{description}</p>
  </div>
)
