import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { Spin } from 'antd'

import { Button, Carousel, Modal } from '@/shared/ui'
import { getPlaceInfo } from '@/shared/api'

import { featureYandexMapStore } from '../models'

const PHOTO_URL = [
  'https://bizfam.ru/images/company/16/1618/161817/c1_c409fefe.jpg',
  'https://avatars.mds.yandex.net/get-altay/236825/2a0000015bc792af0ad240a1769788922ef2/orig',
  'https://истра.рф/upload/webp/100/upload/resize-cache/iblock/563/640-400-1/jnh8hwxx01up0czcivpkm4h4v06zx6mf.webp',
]

export const FeatureInfoCard = observer(() => {
  const { selectedFeature, unselectFeature, placeId } = featureYandexMapStore

  useEffect(() => {
    if (placeId) {
      getPlaceInfo(placeId)
    }
  }, [placeId])

  return (
    <Modal
      open={!!selectedFeature}
      closable
      onCancel={unselectFeature}
      footer={[
        <Button
          key={1}
          onClick={unselectFeature}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Закрыть
        </Button>,
      ]}
      width={600}
    >
      {selectedFeature ? (
        <>
          <Carousel arrows photos={PHOTO_URL} />
          <p className="mt-4">{selectedFeature?.description}</p>
        </>
      ) : (
        <Spin />
      )}
    </Modal>
  )
})
