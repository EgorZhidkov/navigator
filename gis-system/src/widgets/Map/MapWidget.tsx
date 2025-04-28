import type { FC } from 'react'
import { useCallback, useState } from 'react'

import type { IPlace } from '@/entities'
import { PlaceCard, PLACES_MOCK } from '@/entities'
import { Map } from '@/features'
import { Carousel, Modal } from '@/shared/ui'
import { useIsOpen } from '@/shared/hooks'

export const MapWidget: FC = () => {
  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null)
  const { isOpen, handleClose, handleOpen } = useIsOpen(false)

  const handlePlaceClick = useCallback(
    () => (place: IPlace) => {
      setSelectedPlace(place)
      handleOpen
    },
    [handleOpen],
  )

  return (
    <>
      <div className="p-6">
        <Map />
        {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLACES_MOCK.map((place) => (
            <PlaceCard key={place.id} place={place} onOpen={handlePlaceClick} />
          ))}
        </div> */}
        {selectedPlace && (
          <Modal
            open={isOpen}
            onClose={() => setSelectedPlace(null)}
            footer={[
              <button
                key="close"
                onClick={handleClose}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Close
              </button>,
            ]}
            width={600}
          >
            <Carousel photos={selectedPlace.photos} />
            <p className="mt-4 text-gray-700">{selectedPlace.description}</p>
          </Modal>
        )}
      </div>
    </>
  )
}
