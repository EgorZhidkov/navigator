import { kafka } from '../config';
import { logger } from '../config';

const producer = kafka.producer();

export async function connectProducer() {
  try {
    await producer.connect();
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Error connecting to Kafka producer:', error);
    throw error;
  }
}

export async function sendMessage(topic: string, message: any) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
        },
      ],
    });
    logger.info(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    logger.error('Error sending message to Kafka:', error);
    throw error;
  }
}

export async function disconnectProducer() {
  try {
    await producer.disconnect();
    logger.info('Kafka producer disconnected successfully');
  } catch (error) {
    logger.error('Error disconnecting from Kafka producer:', error);
    throw error;
  }
}
