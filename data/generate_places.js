const fs = require('fs');
const path = require('path');

// Читаем типы объектов
const placeTypes = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'place_types.json'), 'utf8')
);

// Основные космодромы России с точными координатами
const cosmodromes = [
  { name: 'Байконур', lat: 45.9646, lon: 63.3052 },
  { name: 'Восточный', lat: 51.8844, lon: 128.3339 },
  { name: 'Плесецк', lat: 62.9256, lon: 40.5775 },
  { name: 'Капустин Яр', lat: 48.5653, lon: 45.8014 },
];

// Ключевые города с космической инфраструктурой
const keyCities = [
  {
    name: 'Королёв',
    lat: 55.9167,
    lon: 37.8167,
    density: 3.0, // Увеличиваем плотность
    realPlaces: [
      { name: 'РКК Энергия', lat: 55.9167, lon: 37.8167, type_id: 4 },
      {
        name: 'Центр управления полетами',
        lat: 55.9167,
        lon: 37.8167,
        type_id: 8,
      },
      { name: 'Музей РКК Энергия', lat: 55.9167, lon: 37.8167, type_id: 2 },
      {
        name: 'НИИ космических систем',
        lat: 55.9167,
        lon: 37.8167,
        type_id: 3,
      },
      {
        name: 'Центр подготовки космонавтов',
        lat: 55.9167,
        lon: 37.8167,
        type_id: 3,
      },
    ],
  },
  {
    name: 'Москва',
    lat: 55.7558,
    lon: 37.6173,
    density: 2.8,
    realPlaces: [
      { name: 'Музей космонавтики', lat: 55.8234, lon: 37.6394, type_id: 2 },
      {
        name: 'Мемориальный музей космонавтики',
        lat: 55.8234,
        lon: 37.6394,
        type_id: 2,
      },
      { name: 'МГТУ им. Баумана', lat: 55.7658, lon: 37.6846, type_id: 6 },
      {
        name: 'НИИ прикладной механики',
        lat: 55.7558,
        lon: 37.6173,
        type_id: 3,
      },
      {
        name: 'Центр космической связи',
        lat: 55.7558,
        lon: 37.6173,
        type_id: 8,
      },
    ],
  },
  {
    name: 'Жуковский',
    lat: 55.6011,
    lon: 38.1161,
    density: 2.6,
    realPlaces: [
      { name: 'ЦАГИ', lat: 55.6011, lon: 38.1161, type_id: 3 },
      {
        name: 'Летно-исследовательский институт',
        lat: 55.6011,
        lon: 38.1161,
        type_id: 3,
      },
      {
        name: 'НИИ авиационных систем',
        lat: 55.6011,
        lon: 38.1161,
        type_id: 3,
      },
      {
        name: 'Центр испытаний авиационной техники',
        lat: 55.6011,
        lon: 38.1161,
        type_id: 3,
      },
    ],
  },
];

// Другие города с космической инфраструктурой
const otherCities = [
  { name: 'Самара', lat: 53.1959, lon: 50.1002, density: 2.4 },
  { name: 'Омск', lat: 54.9914, lon: 73.3645, density: 2.2 },
  { name: 'Красноярск', lat: 56.0184, lon: 92.8672, density: 2.2 },
  { name: 'Воронеж', lat: 51.672, lon: 39.1843, density: 2.0 },
  { name: 'Пермь', lat: 58.0105, lon: 56.2502, density: 2.0 },
  { name: 'Нижний Новгород', lat: 56.3268, lon: 44.0065, density: 2.0 },
  { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351, density: 2.0 },
  { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057, density: 1.9 },
  { name: 'Новосибирск', lat: 55.0084, lon: 82.9357, density: 1.9 },
  { name: 'Казань', lat: 55.7961, lon: 49.1064, density: 1.9 },
  { name: 'Ростов-на-Дону', lat: 47.2225, lon: 39.7187, density: 1.8 },
  { name: 'Уфа', lat: 54.7388, lon: 55.9721, density: 1.8 },
  { name: 'Иркутск', lat: 52.2864, lon: 104.2807, density: 1.8 },
  { name: 'Владивосток', lat: 43.1155, lon: 131.8855, density: 1.7 },
  { name: 'Хабаровск', lat: 48.4802, lon: 135.0719, density: 1.7 },
  { name: 'Томск', lat: 56.4846, lon: 84.9476, density: 1.6 },
  { name: 'Тюмень', lat: 57.1522, lon: 65.5272, density: 1.6 },
  { name: 'Калининград', lat: 54.7104, lon: 20.4522, density: 1.5 },
  { name: 'Волгоград', lat: 48.7071, lon: 44.5169, density: 1.5 },
  { name: 'Саратов', lat: 51.5336, lon: 46.0342, density: 1.5 },
  { name: 'Ярославль', lat: 57.6261, lon: 39.8845, density: 1.4 },
  { name: 'Владимир', lat: 56.129, lon: 40.4066, density: 1.4 },
  { name: 'Рязань', lat: 54.6293, lon: 39.7356, density: 1.4 },
  { name: 'Тула', lat: 54.193, lon: 37.6173, density: 1.4 },
  { name: 'Брянск', lat: 53.2434, lon: 34.3637, density: 1.3 },
  { name: 'Курск', lat: 51.7304, lon: 36.193, density: 1.3 },
  { name: 'Белгород', lat: 50.5957, lon: 36.5873, density: 1.3 },
  { name: 'Орел', lat: 52.9704, lon: 36.0635, density: 1.3 },
  { name: 'Липецк', lat: 52.6088, lon: 39.5992, density: 1.3 },
  { name: 'Тамбов', lat: 52.7212, lon: 41.4523, density: 1.3 },
];

// Генерация случайных координат в радиусе от центра города
function generateRandomCoordinates(centerLat, centerLon, radiusKm) {
  const r = radiusKm / 111.32; // конвертация в градусы
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    lat: centerLat + y,
    lon: centerLon + x / Math.cos((centerLat * Math.PI) / 180),
  };
}

// Генерация объектов
const places = [];

// Добавляем космодромы
cosmodromes.forEach((cosmodrome) => {
  places.push({
    name: `Космодром ${cosmodrome.name}`,
    description: `Космодром ${cosmodrome.name} - один из крупнейших космодромов России`,
    coordinates: {
      type: 'Point',
      coordinates: [cosmodrome.lon, cosmodrome.lat],
    },
    type_id: 1,
    opening_hours: 'Круглосуточно',
  });
});

// Добавляем реальные объекты из ключевых городов
keyCities.forEach((city) => {
  city.realPlaces.forEach((place) => {
    places.push({
      name: place.name,
      description: `${place.name} в городе ${city.name}`,
      coordinates: {
        type: 'Point',
        coordinates: [place.lon, place.lat],
      },
      type_id: place.type_id,
      opening_hours: '09:00-18:00',
    });
  });
});

// Функция генерации объектов для города
function generateCityObjects(city, density) {
  const objects = [];
  const baseCount = Math.floor(60 * density); // Увеличиваем базовое количество объектов

  // Музеи (8-12 объектов)
  for (let i = 0; i < Math.floor(8 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Музей космонавтики ${city.name} ${i + 1}`,
      description: `Музей, посвященный истории космонавтики в городе ${city.name}`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 2,
      opening_hours: '10:00-18:00',
    });
  }

  // Исследовательские центры (6-10 объектов)
  for (let i = 0; i < Math.floor(6 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `НИИ космических исследований ${city.name} ${i + 1}`,
      description: `Научно-исследовательский институт в области космонавтики`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 3,
      opening_hours: '09:00-17:00',
    });
  }

  // Заводы (5-8 объектов)
  for (let i = 0; i < Math.floor(5 + 3 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 3);
    objects.push({
      name: `Завод ракетно-космической техники ${city.name} ${i + 1}`,
      description: `Предприятие по производству ракетно-космической техники`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 4,
      opening_hours: '08:00-20:00',
    });
  }

  // Исторические объекты (8-12 объектов)
  for (let i = 0; i < Math.floor(8 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Исторический объект космонавтики ${city.name} ${i + 1}`,
      description: `Место, связанное с историей развития космонавтики`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 5,
      opening_hours: 'Круглосуточно',
    });
  }

  // Учебные заведения (6-10 объектов)
  for (let i = 0; i < Math.floor(6 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Университет космонавтики ${city.name} ${i + 1}`,
      description: `Высшее учебное заведение, готовящее специалистов в области космонавтики`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 6,
      opening_hours: '08:00-20:00',
    });
  }

  // Памятники (6-10 объектов)
  for (let i = 0; i < Math.floor(6 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Памятник космонавтам ${city.name} ${i + 1}`,
      description: `Памятник, посвященный достижениям в области космонавтики`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 7,
      opening_hours: 'Круглосуточно',
    });
  }

  // Центры управления полетами (3-5 объектов)
  for (let i = 0; i < Math.floor(3 + 2 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Центр управления полетами ${city.name} ${i + 1}`,
      description: `Центр управления космическими аппаратами`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 8,
      opening_hours: 'Круглосуточно',
    });
  }

  // Испытательные полигоны (2-3 объекта)
  for (let i = 0; i < Math.floor(2 + density / 2); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 5);
    objects.push({
      name: `Испытательный полигон ${city.name} ${i + 1}`,
      description: `Полигон для испытаний ракетной техники`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 9,
      opening_hours: 'Круглосуточно',
    });
  }

  // Образовательные центры (6-10 объектов)
  for (let i = 0; i < Math.floor(6 + 4 * density); i++) {
    const coords = generateRandomCoordinates(city.lat, city.lon, 2);
    objects.push({
      name: `Центр дополнительного образования ${city.name} ${i + 1}`,
      description: `Центр дополнительного образования в области космонавтики`,
      coordinates: {
        type: 'Point',
        coordinates: [coords.lon, coords.lat],
      },
      type_id: 10,
      opening_hours: '10:00-20:00',
    });
  }

  return objects;
}

// Генерируем объекты для ключевых городов
keyCities.forEach((city) => {
  const cityObjects = generateCityObjects(city, city.density);
  places.push(...cityObjects);
});

// Генерируем объекты для других городов
otherCities.forEach((city) => {
  const cityObjects = generateCityObjects(city, city.density);
  places.push(...cityObjects);
});

// Сохраняем сгенерированные данные
fs.writeFileSync(
  path.join(__dirname, 'places.json'),
  JSON.stringify(places, null, 2),
  'utf8'
);

console.log(`Сгенерировано ${places.length} объектов`);
