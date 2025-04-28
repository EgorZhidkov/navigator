import proj4 from 'proj4'

// Определение проекций
proj4.defs(
  'EPSG:3857',
  '+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs',
)
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs')

export const convertBbox = (bbox3857: number[]) => {
  return [
    proj4('EPSG:3857', 'EPSG:4326', [bbox3857[0], bbox3857[1]]), // Юго-западный угол
    proj4('EPSG:3857', 'EPSG:4326', [bbox3857[2], bbox3857[3]]), // Северо-восточный угол
  ]
}
