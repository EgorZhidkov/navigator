import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config';
import { logger } from '../config';

export async function initDatabase() {
  try {
    // Читаем SQL-скрипт
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Выполняем SQL-скрипт
    await pool.query(sql);
    logger.info('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
