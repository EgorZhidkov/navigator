import * as fs from 'fs';

const parkingColor = '#653125';
const stationColor = '#0c36e7';
const bikeParking = '#e20404';

export const getFeatureForCheckOnYandex = (features = [], fileNameForCode) => {
  let d = features.reduce((res, rec, i) => {
    if (rec.geometry === undefined || rec === undefined) {
      return res;
    }
    return (
      res +
      `
    .add(new ymaps.Placemark([${rec.geometry.coordinates[1]}, ${rec.geometry.coordinates[0]}], {
    }, {
        iconColor: '#0095b6'
    }))

    `
    );
  }, '');
  try {
    fs.writeFileSync(fileNameForCode, d);
  } catch (err) {
    console.error(err);
  }
};
