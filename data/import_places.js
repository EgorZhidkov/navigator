const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Читаем данные из JSON файла
const places = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'places.json'), 'utf8')
);

// Конфигурация подключения к PostgreSQL
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'geoindex',
  user: 'postgres',
  password: 'postgres',
});

async function importPlaces() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Очищаем таблицу перед импортом
    await client.query('TRUNCATE places CASCADE');
    console.log('Table cleared');

    // Подготавливаем и выполняем запросы для вставки данных
    for (const place of places) {
      const query = `
        INSERT INTO places (name, description, coordinates, type_id, opening_hours)
        VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5, $6)
      `;
      const values = [
        place.name,
        place.description,
        place.coordinates.coordinates[0], // longitude
        place.coordinates.coordinates[1], // latitude
        place.type_id,
        place.opening_hours,
      ];

      await client.query(query, values);
    }

    console.log(`Successfully imported ${places.length} places`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

importPlaces();
