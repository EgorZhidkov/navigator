const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Читаем данные из JSON файла
const placeTypes = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'place_types.json'), 'utf8')
);

// Конфигурация подключения к PostgreSQL
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'geoindex',
  user: 'postgres',
  password: 'postgres',
});

async function importPlaceTypes() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL');

    // Создаем таблицу place_types, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS place_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT
      );
    `);
    console.log('Table created');

    // Очищаем таблицу перед импортом
    await client.query('TRUNCATE place_types CASCADE');
    console.log('Table cleared');

    // Подготавливаем и выполняем запросы для вставки данных
    for (const type of placeTypes) {
      const query = `
        INSERT INTO place_types (id, name, description)
        VALUES ($1, $2, $3)
      `;
      const values = [type.id, type.name, type.description];

      await client.query(query, values);
    }

    console.log(`Successfully imported ${placeTypes.length} place types`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

importPlaceTypes();
