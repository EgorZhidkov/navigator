import { initDatabase } from './db/init';
import {
  connectProducer,
  disconnectProducer,
  sendMessage,
} from './kafka/producer';
import { logger, pool } from './config';

async function main() {
  try {
    // Initialize database
    await initDatabase();
    logger.info('Database initialized');

    // Connect to Kafka
    await connectProducer();
    logger.info('Connected to Kafka');

    // Set up database change listeners
    const client = await pool.connect();
    client.on('notification', async (msg) => {
      if (msg.channel === 'places_changes') {
        const payload = JSON.parse(msg.payload);
        payload.operation = msg.payload.operation || 'update';

        // Получаем координаты в формате PostGIS
        const coordinatesResult = await client.query(
          'SELECT ST_AsText(coordinates) as point FROM places WHERE id = $1',
          [payload.id]
        );

        if (coordinatesResult.rows.length > 0) {
          const point = coordinatesResult.rows[0].point;
          // Извлекаем координаты из строки POINT(lon lat)
          const match = point.match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
          if (match) {
            const longitude = parseFloat(match[1]);
            const latitude = parseFloat(match[2]);
            payload.coordinates = {
              type: 'Point',
              coordinates: [longitude, latitude],
            };
          }
        }

        await sendMessage('places', payload);
      }
    });

    await client.query('LISTEN places_changes');
    logger.info('Listening for database changes');

    // Keep the process running
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await disconnectProducer();
      client.release();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error in main process:', error);
    process.exit(1);
  }
}

main();
