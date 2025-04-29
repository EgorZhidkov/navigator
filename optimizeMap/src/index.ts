import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { getFeatureCollection } from './RemoteObjectManagerArtem/getFeatureCollection';
import { getTracksPoints } from './Track/getTrackByObjects';
import { createTrackFromPolygon } from './Track/createTrack';
import { mockSpace } from './RemoteObjectManagerArtem/mockData/mockSpace';
import { getSpaceObjectsList } from './RemoteObjectManagerArtem/getSpaceObjectsList';
import { searchSpaceObjects } from './RemoteObjectManagerArtem/searchSpaceObjects';
import { logger } from './utils/logger';
import * as dotenv from 'dotenv';
import { connectRedis, getPlacesByBbox } from './redis/places';
import { RouteService } from './Track/RouteService';
import { Pool } from 'pg';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { WebSocket } from 'ws';
import { WebSocketService } from './Track/WebSocketService';
import Redis from 'ioredis';
import { RouteOptimizer } from './Track/RouteOptimizer';
import { RouteWebSocket } from './websocket/RouteWebSocket';

dotenv.config();

// Константы
const PORT = process.env.PORT || 8000;
const POW_OF_TILES = 5; // 64 квадрата

// Инициализация Express приложения
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

/**
 * Middleware для логирования запросов и ответов
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Логируем входящий запрос
  logger.request(req.method, req.url, req.body);

  // Перехватываем отправку ответа
  const originalSend = res.json;
  res.json = function (body) {
    const responseTime = Date.now() - start;
    logger.response(req.method, req.url, res.statusCode, responseTime, body);
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(
      `[${req.method}] ${req.originalUrl} - Status: ${res.statusCode} - Time: ${duration}ms`
    );
  });

  next();
});

/**
 * Обработчик ошибок
 */
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Внутренняя ошибка сервера', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
};

/**
 * Парсер bbox параметра запроса
 * @param {string} bboxString - строка bbox в формате 'x1,y1,x2,y2'
 * @returns {Object} объект с координатами или null при ошибке
 */
const parseBboxParam = (
  bboxString: string
): {
  leftBottomX: number;
  leftBottomY: number;
  rightTopX: number;
  rightTopY: number;
} | null => {
  if (!bboxString) return null;

  try {
    const [leftBottomX, leftBottomY, rightTopX, rightTopY] = bboxString
      .split(',')
      .map(Number);

    if (
      isNaN(leftBottomX) ||
      isNaN(leftBottomY) ||
      isNaN(rightTopX) ||
      isNaN(rightTopY)
    ) {
      return null;
    }

    return { leftBottomX, leftBottomY, rightTopX, rightTopY };
  } catch (e) {
    return null;
  }
};

// Подключение к Redis при запуске сервера
let redisConnected = false;

async function initializeRedis() {
  try {
    await connectRedis();
    redisConnected = true;
    logger.info('Successfully connected to Redis');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Не завершаем процесс, а продолжаем работу без Redis
    redisConnected = false;
  }
}

initializeRedis();

// Создаем пул подключений к PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'geoindex',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Создаем экземпляр сервиса маршрутов
const routeService = new RouteService(pool);

// Создаем HTTP сервер
const server = createServer(app);

// Создаем Redis клиент
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

// Создаем WebSocket сервис
const wsService = new WebSocketService(server, routeService, redis);

// Запускаем сервер
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

/**
 * GET /spaceObject - Возвращает данные космических объектов
 */
app.get('/spaceObject', (req: Request, res: Response) => {
  logger.info('Получение данных космических объектов');
  res.json(mockSpace);
});

/**
 * GET /spaceObjects - Возвращает список космических объектов в нужном формате
 */
app.get('/spaceObjects', (req: Request, res: Response) => {
  try {
    logger.info('Получение списка космических объектов');
    const data = getSpaceObjectsList();
    res.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error(
      'Ошибка при получении списка космических объектов',
      errorMessage
    );
    res
      .status(500)
      .json({ error: 'Ошибка при получении списка космических объектов' });
  }
});

/**
 * POST /tracks - Возвращает информацию о треках
 */
app.post('/tracks', (req: Request, res: Response) => {
  try {
    logger.info('Получение информации о треках');
    const tracks = getTracksPoints();
    res.json(tracks);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при получении треков', errorMessage);
    res.status(500).json({ error: 'Ошибка при получении треков' });
  }
});

/**
 * GET /calculateMapData - Вычисляет и возвращает коллекцию объектов для отображения на карте
 */
app.get('/calculateMapData', async (req: Request, res: Response) => {
  try {
    if (!redisConnected) {
      if (req.query.callback) {
        res.type('application/javascript');
        return res.send(
          `${req.query.callback}(${JSON.stringify({
            error: 'Redis service is unavailable',
          })})`
        );
      }
      return res.status(503).json({ error: 'Redis service is unavailable' });
    }

    const { bbox, zoom, callback } = req.query;

    if (!bbox || !zoom) {
      if (callback) {
        res.type('application/javascript');
        return res.send(
          `${callback}(${JSON.stringify({
            error: 'Missing required parameters',
          })})`
        );
      }
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const [leftBottomX, leftBottomY, rightTopX, rightTopY] = (bbox as string)
      .split(',')
      .map(Number);

    logger.info('Расчет данных карты', {
      bbox: { leftBottomX, leftBottomY, rightTopX, rightTopY },
      zoom: Number(zoom),
    });

    // Получаем места из Redis
    const places = await getPlacesByBbox({
      leftBottomX,
      leftBottomY,
      rightTopX,
      rightTopY,
    });

    // Преобразуем места в формат ISpace
    const spaceData = places.map((place) => ({
      id: place.id,
      system_id: '39b47217-46d8-44c7-8d71-e4201a911c07',
      title: place.name,
      info: place.description,
      photo: [],
      geo: {
        latitude: place.coordinates.latitude,
        longitude: place.coordinates.longitude,
      },
    }));

    // Используем getFeatureCollection для обработки данных
    const featureCollection = await getFeatureCollection(
      leftBottomX,
      leftBottomY,
      rightTopX,
      rightTopY,
      POW_OF_TILES,
      Number(zoom),
      spaceData
    );

    res.jsonp(featureCollection);

    // const response = {
    //   ...featureCollection,
    //   zoom: Number(zoom),
    // };

    // if (callback) {
    //   res.type('application/javascript');
    //   res.send(`${callback}(${JSON.stringify(response)})`);
    // } else {
    //   res.json(response);
    // }
  } catch (error) {
    logger.error('Ошибка при расчете данных карты', error);
    if (req.query.callback) {
      res.type('application/javascript');
      res.send(
        `${req.query.callback}(${JSON.stringify({
          error: 'Ошибка при расчете данных карты',
        })})`
      );
    } else {
      res.status(500).json({ error: 'Ошибка при расчете данных карты' });
    }
  }
});

/**
 * POST /createTrackFromPolygon - Создает трек на основе полигона
 */
app.post('/createTrackFromPolygon', async (req: Request, res: Response) => {
  const { polygon } = req.body;

  if (!polygon) {
    logger.error('Не указан полигон в теле запроса');
    return res.status(400).json({ error: 'Не указан полигон в теле запроса' });
  }

  try {
    logger.info('Создание трека из полигона', { polygon });
    const track = createTrackFromPolygon(polygon);
    res.json(track);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при создании трека из полигона', errorMessage);
    res.status(500).json({ error: 'Ошибка при создании трека из полигона' });
  }
});

/**
 * POST /searchSpaceObjects - Поиск космических объектов по названию
 */
app.post('/searchSpaceObjects', (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query) {
    logger.error('Не указан поисковый запрос в теле запроса');
    return res
      .status(400)
      .json({ error: 'Не указан поисковый запрос в теле запроса' });
  }

  try {
    logger.info('Поиск космических объектов', { query });
    const data = searchSpaceObjects(query);
    res.json(data);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при поиске космических объектов', errorMessage);
    res.status(500).json({ error: 'Ошибка при поиске космических объектов' });
  }
});

/**
 * GET /routes - Получение списка всех маршрутов
 */
app.get('/routes', async (req: Request, res: Response) => {
  try {
    logger.info('Получение списка маршрутов');
    const routes = await routeService.getRoutes();
    res.json(routes);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при получении списка маршрутов:', errorMessage);
    res.status(500).json({ error: 'Ошибка при получении списка маршрутов' });
  }
});

/**
 * GET /routes/:id - Получение информации о конкретном маршруте
 */
app.get('/routes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID маршрута' });
    }

    logger.info(`Получение информации о маршруте ${id}`);
    const route = await routeService.getRouteById(id);

    if (!route) {
      return res.status(404).json({ error: 'Маршрут не найден' });
    }

    res.json(route);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при получении информации о маршруте:', errorMessage);
    res
      .status(500)
      .json({ error: 'Ошибка при получении информации о маршруте' });
  }
});

/**
 * POST /routes - Создание нового маршрута
 */
app.post('/routes', async (req: Request, res: Response) => {
  try {
    const routeData = req.body;
    logger.info('Создание нового маршрута:', routeData);
    const route = await routeService.createRoute(routeData);
    res.status(201).json(route);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при создании маршрута:', errorMessage);
    res.status(500).json({ error: 'Ошибка при создании маршрута' });
  }
});

/**
 * PUT /routes/:id - Обновление маршрута
 */
app.put('/routes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID маршрута' });
    }

    const routeData = req.body;
    logger.info(`Обновление маршрута ${id}:`, routeData);
    const route = await routeService.updateRoute(id, routeData);

    if (!route) {
      return res.status(404).json({ error: 'Маршрут не найден' });
    }

    res.json(route);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при обновлении маршрута:', errorMessage);
    res.status(500).json({ error: 'Ошибка при обновлении маршрута' });
  }
});

/**
 * DELETE /routes/:id - Удаление маршрута
 */
app.delete('/routes/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID маршрута' });
    }

    logger.info(`Удаление маршрута ${id}`);
    const success = await routeService.deleteRoute(id);

    if (!success) {
      return res.status(404).json({ error: 'Маршрут не найден' });
    }

    res.status(204).send();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при удалении маршрута:', errorMessage);
    res.status(500).json({ error: 'Ошибка при удалении маршрута' });
  }
});

/**
 * GET /route-types - Получение списка типов маршрутов
 */
app.get('/route-types', async (req: Request, res: Response) => {
  try {
    logger.info('Получение списка типов маршрутов');
    const types = await routeService.getRouteTypes();
    res.json(types);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при получении списка типов маршрутов:', errorMessage);
    res
      .status(500)
      .json({ error: 'Ошибка при получении списка типов маршрутов' });
  }
});

/**
 * POST /routes/from-polygon - Создание нового маршрута из полигона
 */
app.post('/routes/from-polygon', async (req: Request, res: Response) => {
  try {
    const { polygon } = req.body;

    if (!polygon) {
      return res.status(400).json({
        error: 'Необходимо указать polygon',
      });
    }

    logger.info('Создание трека из полигона');
    const track = createTrackFromPolygon(polygon);
    res.status(200).json(track);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при создании трека из полигона:', errorMessage);
    res.status(500).json({ error: 'Ошибка при создании трека из полигона' });
  }
});

/**
 * GET /places/:id - Получение информации о месте
 */
app.get('/places/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Неверный ID места' });
    }

    logger.info(`Получение информации о месте ${id}`);
    const place = await routeService.getPlaceById(id);

    if (!place) {
      return res.status(404).json({ error: 'Место не найдено' });
    }

    res.json(place);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при получении информации о месте:', errorMessage);
    res.status(500).json({ error: 'Ошибка при получении информации о месте' });
  }
});

// Эндпоинты для оптимизированных маршрутов
app.get('/routes/:id/optimized', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const routeSegments = await routeService.getOptimizedRoute(routeId);
    res.json(routeSegments);
  } catch (error) {
    logger.error('Error getting optimized route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /routes/:id/location - Обновление текущей локации для маршрута
 */
app.post('/routes/:id/location', async (req: Request, res: Response) => {
  try {
    const routeId = parseInt(req.params.id);
    if (isNaN(routeId)) {
      return res.status(400).json({ error: 'Неверный ID маршрута' });
    }

    const { latitude, longitude } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'Неверный формат координат' });
    }

    logger.info(`Обновление локации для маршрута ${routeId}:`, {
      latitude,
      longitude,
    });

    // Получаем оптимизированный маршрут
    const segments = await routeService.getOptimizedRoute(routeId);

    // Обновляем прогресс
    const progress = await routeService.updateRouteProgress(
      { latitude, longitude },
      segments
    );

    res.json(progress);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    logger.error('Ошибка при обновлении локации:', errorMessage);
    res.status(500).json({ error: 'Ошибка при обновлении локации' });
  }
});

app.post('/routes/:id/progress', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Latitude and longitude are required' });
    }

    const progress = await routeService.updateRouteProgress(routeId, {
      latitude,
      longitude,
    });
    res.json(progress);
  } catch (error) {
    logger.error('Error updating route progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/routes/:id/recalculate', async (req, res) => {
  try {
    const routeId = parseInt(req.params.id);
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: 'Latitude and longitude are required' });
    }

    const newRoute = await routeService.recalculateRoute(routeId, {
      latitude,
      longitude,
    });
    res.json(newRoute);
  } catch (error) {
    logger.error('Error recalculating route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Регистрация обработчика ошибок
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');

  // Закрываем соединения с базой данных
  await pool.end();
  await redis.quit();

  // Закрываем HTTP сервер
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Инициализация RouteOptimizer
const routeOptimizer = new RouteOptimizer(
  redis,
  process.env.OSRM_URL || 'http://localhost:5000'
);

// Инициализация WebSocket сервера
const routeWebSocket = new RouteWebSocket(server, routeOptimizer, redis);
