import { useCallback, useEffect } from 'react'
import { observer } from 'mobx-react-lite'

import { trackStore } from '@/entities'
import { getTracks } from '@/shared/api'
import { TracksInformation } from '@/features'
import { TrackOnMap } from '@/entities/track'
import { ChoosenTrackInformation } from '@/features/ChoosenTrackInformation'

export const TracksModalInfo = observer(() => {
  const { toggleTrackWindow, baseTracks, track } = trackStore

  useEffect(() => {
    getTracks()
  }, [])

  const handleClose = useCallback(() => {
    toggleTrackWindow()
  }, [toggleTrackWindow])

  return (
    <>
      {!track ? (
        <TracksInformation handleClose={handleClose} tracks={baseTracks} />
      ) : (
        <ChoosenTrackInformation handleClose={handleClose} />
      )}

      <TrackOnMap />
    </>
  )
})
