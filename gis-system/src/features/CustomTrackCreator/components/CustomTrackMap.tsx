import type { Map as TMap } from 'yandex-maps'
import { useCallback, useEffect, useState, useRef } from 'react'
import type { FC } from 'react'
import { Polygon, withYMaps } from '@pbe/react-yandex-maps'
import type { YMapsApi } from '@pbe/react-yandex-maps/typings/util/typing'
import { observer } from 'mobx-react-lite'
import { Map as YMap } from '@pbe/react-yandex-maps'

import { DEFAULT_ZOOM, MAP_CENTER } from '@/shared'
import { EMapObjectsType, mapObjectsStore } from '@/shared'

import { POLYGON_OPTIONS } from '../model/const'
import {
  createTrackFromPolygonHandler,
  initializeObjectManager,
} from '../utils'

import { PolygonControls } from './PolygonControls'

interface PolygonChangeEvent {
  get: (key: string) => number[][][]
}

interface IPolygonWithEditor {
  geometry: {
    getCoordinates: () => number[][][]
    setCoordinates: (coordinates: number[][][]) => void
    events: {
      add: (event: string, callback: (e: PolygonChangeEvent) => void) => void
    }
  }
  editor: {
    startDrawing: () => void
    stopEditing: () => void
    events: {
      add: (event: string, callback: () => void) => void
    }
  }
}

// Тип для RemoteObjectManager из Яндекс Карт

interface CustomTrackMapProps {
  onClose: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ymaps?: YMapsApi & { RemoteObjectManager: any }
}

const mapDefaultState: ymaps.IMapState = {
  center: MAP_CENTER,
  zoom: DEFAULT_ZOOM,
  controls: [],
}

export const CustomTrackMapComponent: FC<CustomTrackMapProps> = observer(
  ({ onClose, ymaps }) => {
    const [pointCoordinates, setPointCoordinates] = useState<number[][][]>([])
    const [polygonInstance, setPolygonInstance] =
      useState<IPolygonWithEditor | null>(null)
    const [canCreateTrack, setCanCreateTrack] = useState(false)
    const mapRef = useRef<TMap | null>(null)
    const [, setMapInstance] = useState<YMapsApi | null>(null)

    const map = mapRef.current

    useEffect(() => {
      if (!map || !ymaps) return

      initializeObjectManager(ymaps, map)

      return () => {
        if (map) {
          mapObjectsStore.removeObject(
            EMapObjectsType.customTrackObjectManager,
            map,
          )
          mapObjectsStore.removeObject(EMapObjectsType.customTrackPolygon, map)
        }
      }
    }, [map, ymaps])

    // Функция для обработки полигона
    const instanceRef = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (ref: any) => {
        if (ref) {
          setPolygonInstance(ref as IPolygonWithEditor)
          ref.editor.startDrawing()

          ref.geometry.events.add('change', (e: PolygonChangeEvent) => {
            const newCoordinates = e.get('newCoordinates')
            setPointCoordinates(newCoordinates)

            if (
              newCoordinates &&
              newCoordinates[0] &&
              newCoordinates[0].length >= 3
            ) {
              setCanCreateTrack(true)
            } else {
              setCanCreateTrack(false)
            }
          })

          ref.editor.events.add('drawingstop', () => {
            if (pointCoordinates[0] && pointCoordinates[0].length >= 3) {
              setCanCreateTrack(true)
            }
          })
        }
      },
      [pointCoordinates],
    )

    const handleCreateTrack = useCallback(async () => {
      if (!polygonInstance || !canCreateTrack) return

      try {
        await createTrackFromPolygonHandler(
          { current: polygonInstance },
          map,
          onClose,
        )
      } catch (error) {
        console.error('Ошибка при создании трека:', error)
      }
    }, [polygonInstance, canCreateTrack, onClose, map])

    const handleResetPolygon = useCallback(() => {
      if (polygonInstance) {
        try {
          polygonInstance.editor.stopEditing()
          setPointCoordinates([])
          setCanCreateTrack(false)
          polygonInstance.editor.startDrawing()
        } catch (error) {
          console.error('Ошибка при сбросе полигона:', error)
        }
      }
    }, [polygonInstance])

    return (
      <div className="h-[600px] relative">
        <YMap
          instanceRef={(ref) => {
            if (ref) mapRef.current = ref
          }}
          options={{
            yandexMapDisablePoiInteractivity: true,
          }}
          modules={[
            'util.bind',
            'util.bounds',
            'templateLayoutFactory',
            'layout.ImageWithContent',
            'layout.PieChart',
            'layout.Image',
            'geoObject.addon.balloon',
            'geoObject.addon.hint',
            'geoObject.addon.editor',
          ]}
          defaultState={mapDefaultState}
          width="100%"
          height="100%"
          onLoad={setMapInstance}
        >
          <Polygon
            instanceRef={instanceRef}
            geometry={pointCoordinates}
            options={{
              // @ts-ignore - Игнорируем проблемы с типами, которые не влияют на работу
              editorMaxPoints: 5,
              fillColor: POLYGON_OPTIONS.fillColor,
              strokeColor: POLYGON_OPTIONS.strokeColor,
              strokeWidth: POLYGON_OPTIONS.strokeWidth,
              opacity: 0.2,
            }}
          />

          <PolygonControls
            onFinish={handleCreateTrack}
            onReset={handleResetPolygon}
            disabled={!canCreateTrack}
          />
        </YMap>
      </div>
    )
  },
)

export const CustomTrackMap = withYMaps(CustomTrackMapComponent, true, [
  'Polygon',
  'geometryEditor.Polygon',
  'map.GeoObjects',
  'Monitor',
  'geoObject.addon.editor',
  'RemoteObjectManager',
  'templateLayoutFactory',
])
