import type { CollapseProps } from 'antd'
import { Collapse } from 'antd'
import { observer } from 'mobx-react-lite'
import type { MouseEventHandler } from 'react'
import { useCallback, useMemo, type FC } from 'react'

import type { IRoute } from '@/entities/track'
import { trackStore } from '@/entities/track'
import { Button, Modal } from '@/shared/ui'

import { getNestedCollapseTrackInfo } from './utils'

interface ITrackWindowProps {
  classname?: string
  tracks: IRoute[]
  handleClose: () => void
}

export const TracksInformation: FC<ITrackWindowProps> = observer(
  ({ tracks, handleClose }) => {
    const { chooseTrack, isOpenTracks } = trackStore

    const handleBuildTrack = useCallback(
      (track: IRoute): MouseEventHandler<HTMLElement> =>
        (event) => {
          event.stopPropagation()
          chooseTrack(track)
          handleClose()
        },
      [chooseTrack, handleClose],
    )

    const trackItemsCollapse: CollapseProps['items'] = useMemo(
      () =>
        tracks?.map((track: IRoute) => {
          return {
            key: track.id,
            label: track.description,
            children: <Collapse items={getNestedCollapseTrackInfo(track)} />,
            extra: <Button onClick={handleBuildTrack(track)}>Построить</Button>,
          }
        }),
      [handleBuildTrack, tracks],
    )

    return (
      <Modal open={isOpenTracks} onCancel={handleClose} footer={null}>
        <Collapse items={trackItemsCollapse} />
      </Modal>
    )
  },
)
