import type { FC } from 'react'
import type { CarouselProps } from 'antd'
import { Carousel as AntCarousel } from 'antd'

interface ICarouselProps extends CarouselProps {
  photos: string[]
}

export const Carousel: FC<ICarouselProps> = ({ photos, ...props }) => {
  return (
    <AntCarousel {...props} className="rounded-lg overflow-hidden">
      {photos.map((photo, index) => (
        <div key={index}>
          <img
            src={photo}
            alt={`Slide ${index}`}
            className="w-full h-64 object-cover"
          />
        </div>
      ))}
    </AntCarousel>
  )
}
