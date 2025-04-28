import { EMapObjectsType, mapObjectsStore } from '@/shared'
import { trackStore } from '@/entities'
import { createTrackFromPolygon } from '@/shared/api/services/tracks'

interface IPolygonWithEditor {
  geometry: {
    getCoordinates: () => number[][][]
    setCoordinates: (coordinates: number[][][]) => void
  }
  editor: {
    startDrawing: () => void
    stopEditing: () => void
  }
}

export const createTrackFromPolygonHandler = async (
  polygonRef: React.RefObject<IPolygonWithEditor>,
  map: ymaps.Map | null,
  onClose: () => void,
): Promise<void> => {
  if (!polygonRef.current) return

  const coordinates = polygonRef.current.geometry.getCoordinates()
  if (!coordinates || !coordinates.length) {
    console.error('Не удалось получить координаты полигона')
    return
  }

  try {
    await createTrackFromPolygon({ coordinates })
    onClose()

    if (!trackStore.isOpenTracks) {
      trackStore.toggleTrackWindow()
    }

    if (map) {
      mapObjectsStore.removeObject(
        EMapObjectsType.customTrackObjectManager,
        map,
      )
      mapObjectsStore.removeObject(EMapObjectsType.customTrackPolygon, map)
    }
  } catch (error) {
    console.error('Ошибка при создании трека:', error)
  }
}

export const resetPolygonHandler = (
  polygonRef: React.RefObject<IPolygonWithEditor>,
): void => {
  if (!polygonRef.current || !polygonRef.current.geometry) return

  try {
    if (polygonRef.current.editor) {
      polygonRef.current.editor.stopEditing()
    }

    polygonRef.current.geometry.setCoordinates([])

    if (polygonRef.current.editor) {
      polygonRef.current.editor.startDrawing()
    }
  } catch (error) {
    console.error('Ошибка при сбросе полигона:', error)
  }
}

export const cleanupTrackObjects = (map: ymaps.Map | null): void => {
  if (!map) return

  mapObjectsStore.removeObject(EMapObjectsType.customTrackObjectManager, map)
  mapObjectsStore.removeObject(EMapObjectsType.customTrackPolygon, map)
  map.controls.remove('zoomControl')
}
