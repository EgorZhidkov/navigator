import type { CollapseProps } from 'antd'

import type { IRoute } from '@/entities'

export const getNestedCollapseTrackInfo = (
  track: IRoute,
): CollapseProps['items'] =>
  track.points?.map((trackPoints) => {
    return {
      key: trackPoints.id,
      label: trackPoints.place.name,
      children: `Описание: ${trackPoints.place.description}`,
    }
  })
