import { Button, Card } from 'antd'
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { observer } from 'mobx-react-lite'

import { trackStore } from '@/entities'
import { DraggableList, Modal } from '@/shared/ui'
import { EMapObjectsType, mapObjectsStore, useYandexMap } from '@/shared'

interface IProps {
  handleClose: () => void
}

export const ChoosenTrackInformation: FC<IProps> = observer(
  ({ handleClose }) => {
    const { track, chooseTrack, isOpenTracks, clearTrack } = trackStore
    const { removeObject } = mapObjectsStore
    const map = useYandexMap()

    const [trackLocal, setTrackLocal] = useState(track?.points || [])

    const handleRecreateTrack = useCallback(() => {
      if (track) {
        chooseTrack({ ...track, points: trackLocal })
        handleClose()
      }
    }, [chooseTrack, handleClose, track, trackLocal])

    const handleReturnToChooseTracks = useCallback(() => {
      if (map) {
        removeObject(EMapObjectsType.activeTrack, map)
        clearTrack()
      }
    }, [clearTrack, map, removeObject])

    if (!track)
      return <div className="text-center text-gray-500">Трек не выбран</div>

    return (
      <Modal
        open={isOpenTracks}
        onCancel={handleClose}
        footer={[
          <Button key="1" onClick={handleReturnToChooseTracks}>
            Вернуться к маршрутам
          </Button>,
          <Button key="2" onClick={handleRecreateTrack}>
            Перестроить маршрут
          </Button>,
        ]}
      >
        <div className="p-5">
          <h2 className="text-2xl font-bold mb-4">{track.name}</h2>
          <DraggableList
            onItemsChange={setTrackLocal}
            items={trackLocal}
            className="shadow-lg rounded-lg"
            itemClassName="mb-4"
            renderItem={(point, index, dragProps) => (
              <Card
                title={point.place.name}
                className={`
              w-full border-2 border-transparent
              ${dragProps.className}
              hover:border-blue-500 transition-colors
            `}
              >
                {`${point.place.coordinates.latitude}, ${point.place.coordinates.longitude}`}
              </Card>
            )}
          />
        </div>
      </Modal>
    )
  },
)
