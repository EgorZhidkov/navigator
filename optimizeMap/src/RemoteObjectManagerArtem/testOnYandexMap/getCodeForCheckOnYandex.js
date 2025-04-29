import * as fs from 'fs';
export const getCodeForCheckOnYandex = (result = [], fileNameForCode) => {
  let d = result.reduce((res, rec, i) => {
    return (
      res +
      `rec${i} = new ymaps.GeoObject({
          geometry: {
            type: 'Rectangle',
            coordinates: [
                [${rec.rightTopY}, ${rec.rightTopX}],
                [${rec.leftBottomY}, ${rec.leftBottomX}]
            ]
        },
        }, {
          fillColor: '#${((Math.random() * 0xffffff) << 0)
            .toString(16)
            .padStart(6, '0')}',
        })
        
        `
    );
  }, '');
  d = `${d}
      myMap.geoObjects.${result.reduce((prev, init, index) => {
        return (
          prev +
          `.add(rec${index})
        `
        );
      }, '')}
      `;
  try {
    fs.writeFileSync(fileNameForCode, d);
  } catch (err) {
    console.error(err);
  }
};
