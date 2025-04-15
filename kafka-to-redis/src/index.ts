import { kafka, redisClient } from './config';
import { logger } from './config';
import { addPlaceToGeoIndex } from './redis/geo';

async function main() {
  try {
    // Connect to Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Create Kafka consumer
    const consumer = kafka.consumer({ groupId: 'geo-index-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'places', fromBeginning: true });
    logger.info('Connected to Kafka and subscribed to places topic');

    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const place = JSON.parse(message.value?.toString() || '{}');
          await addPlaceToGeoIndex(place);
          logger.info(
            `Processed message from topic ${topic}, partition ${partition}`
          );
        } catch (error) {
          logger.error('Error processing message:', error);
        }
      },
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await consumer.disconnect();
      await redisClient.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error in main process:', error);
    process.exit(1);
  }
}

main();
