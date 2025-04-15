import { createClient } from 'redis';
import { Kafka } from 'kafkajs';
import winston from 'winston';

// Redis configuration
export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Kafka configuration
export const kafka = new Kafka({
  clientId: 'kafka-to-redis',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
});

// Logger configuration
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
