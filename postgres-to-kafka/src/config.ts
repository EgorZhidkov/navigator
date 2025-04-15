import { Pool } from 'pg';
import { Kafka } from 'kafkajs';
import winston from 'winston';

// PostgreSQL configuration
export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Kafka configuration
export const kafka = new Kafka({
  clientId: 'postgres-to-kafka',
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
