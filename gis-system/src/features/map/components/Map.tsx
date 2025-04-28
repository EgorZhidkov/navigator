import { useRef } from 'react'

import 'ol/ol.css'
import { useMap } from '../../../shared/hooks/useMap'

export const Map: React.FC = () => {
  const mapElement = useRef<HTMLDivElement>(null)
  const map = useMap(mapElement.current, {
    center: [37.618423, 55.751244],
    zoom: 10,
  })

  return (
    <div ref={mapElement} className="w-full h-screen">
      <div ref={map}></div>
    </div>
  )
}
