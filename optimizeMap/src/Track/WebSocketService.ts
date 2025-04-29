import { WebSocket, WebSocketServer } from 'ws';
import { logger } from '../utils/logger';
import { RouteService } from './RouteService';
import {
  IWebSocketMessage,
  IWebSocketInitMessage,
  IWebSocketLocationMessage,
  IWebSocketRouteMessage,
  IWebSocketProgressMessage,
  IWebSocketErrorMessage,
} from './types/IWebSocket';
import { Redis } from 'ioredis';

export class WebSocketService {
  private wss: WebSocketServer;
  private routeService: RouteService;
  private redis: Redis;
  private activeConnections: Map<number, WebSocket>;
  private locationUpdateInterval: Map<number, NodeJS.Timeout>;
  private readonly LOCATION_UPDATE_INTERVAL = 5000; // 5 секунд
  private readonly ROUTE_RECALCULATION_THRESHOLD = 1000; // 1 км

  constructor(server: any, routeService: RouteService, redis: Redis) {
    this.wss = new WebSocketServer({ server });
    this.routeService = routeService;
    this.redis = redis;
    this.activeConnections = new Map();
    this.locationUpdateInterval = new Map();

    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket connection established');
      let routeId: number | null = null;

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message) as IWebSocketMessage;
          logger.info('Received WebSocket message:', data);

          switch (data.type) {
            case 'init':
              await this.handleInit(ws, data as IWebSocketInitMessage);
              break;
            case 'location':
              await this.handleLocation(
                ws,
                data as IWebSocketLocationMessage,
                routeId
              );
              break;
            default:
              logger.info('Unknown message type:', data.type);
              this.sendError(ws, 'Неизвестный тип сообщения');
          }
        } catch (error) {
          logger.error('WebSocket error:', error);
          this.sendError(ws, 'Внутренняя ошибка сервера');
        }
      });

      ws.on('close', () => {
        logger.info('WebSocket connection closed');
        if (routeId) {
          this.cleanupRoute(routeId);
        }
      });
    });
  }

  private async handleInit(ws: WebSocket, message: IWebSocketInitMessage) {
    const { routeId } = message.data;
    logger.info(`Initializing route ${routeId}`);

    try {
      // Проверяем кэш
      const cachedRoute = await this.redis.get(`route:${routeId}`);
      let routeSegments;

      if (cachedRoute) {
        logger.info(`Using cached route for ${routeId}`);
        routeSegments = JSON.parse(cachedRoute);
      } else {
        logger.info(`Calculating new route for ${routeId}`);
        // Получаем оптимизированный маршрут
        routeSegments = await this.routeService.getOptimizedRoute(routeId);
        // Кэшируем маршрут
        await this.redis.set(
          `route:${routeId}`,
          JSON.stringify(routeSegments),
          'EX',
          3600 // 1 час
        );
      }

      // Сохраняем соединение
      this.activeConnections.set(routeId, ws);
      logger.info(`Active connections: ${this.activeConnections.size}`);

      // Отправляем маршрут
      this.sendRoute(ws, routeSegments);
      logger.info(`Route sent to client for ${routeId}`);

      // Запускаем периодическое обновление геолокации
      this.startLocationUpdates(routeId);
    } catch (error) {
      logger.error(`Error initializing route ${routeId}:`, error);
      this.sendError(ws, 'Ошибка при инициализации маршрута');
    }
  }

  private async handleLocation(
    ws: WebSocket,
    message: IWebSocketLocationMessage,
    routeId: number | null
  ) {
    if (!routeId) {
      this.sendError(ws, 'Маршрут не инициализирован');
      return;
    }

    try {
      const { latitude, longitude } = message.data;

      // Сохраняем текущую локацию в кэш
      await this.redis.set(
        `location:${routeId}`,
        JSON.stringify({ latitude, longitude }),
        'EX',
        3600
      );

      // Получаем прогресс
      const progress = await this.routeService.updateRouteProgress(routeId, {
        latitude,
        longitude,
      });

      // Отправляем прогресс
      this.sendProgress(ws, progress);

      // Если пользователь сильно отклонился от маршрута
      if (progress.remainingDistance > this.ROUTE_RECALCULATION_THRESHOLD) {
        // Пересчитываем маршрут
        const newRoute = await this.routeService.recalculateRoute(routeId, {
          latitude,
          longitude,
        });

        // Обновляем кэш
        await this.redis.set(
          `route:${routeId}`,
          JSON.stringify(newRoute),
          'EX',
          3600
        );

        // Отправляем новый маршрут
        this.sendRoute(ws, newRoute);
      }
    } catch (error) {
      logger.error(`Error handling location for route ${routeId}:`, error);
      this.sendError(ws, 'Ошибка при обработке местоположения');
    }
  }

  private startLocationUpdates(routeId: number) {
    // Очищаем предыдущий интервал, если он существует
    if (this.locationUpdateInterval.has(routeId)) {
      clearInterval(this.locationUpdateInterval.get(routeId));
    }

    // Запускаем новый интервал
    const interval = setInterval(async () => {
      const ws = this.activeConnections.get(routeId);
      if (!ws) {
        this.cleanupRoute(routeId);
        return;
      }

      try {
        // Получаем последнюю известную локацию из кэша
        const lastLocation = await this.redis.get(`location:${routeId}`);
        if (lastLocation) {
          const { latitude, longitude } = JSON.parse(lastLocation);
          await this.handleLocation(
            ws,
            {
              type: 'location',
              data: { latitude, longitude },
            } as IWebSocketLocationMessage,
            routeId
          );
        }
      } catch (error) {
        logger.error(
          `Error in location update interval for route ${routeId}:`,
          error
        );
      }
    }, this.LOCATION_UPDATE_INTERVAL);

    this.locationUpdateInterval.set(routeId, interval);
  }

  private cleanupRoute(routeId: number) {
    // Очищаем интервал обновления локации
    if (this.locationUpdateInterval.has(routeId)) {
      clearInterval(this.locationUpdateInterval.get(routeId));
      this.locationUpdateInterval.delete(routeId);
    }

    // Удаляем соединение
    this.activeConnections.delete(routeId);

    // Очищаем кэш локации
    this.redis.del(`location:${routeId}`);
  }

  private sendRoute(ws: WebSocket, routeSegments: any) {
    const message: IWebSocketRouteMessage = {
      type: 'route',
      data: {
        segments: routeSegments,
      },
    };
    ws.send(JSON.stringify(message));
  }

  private sendProgress(ws: WebSocket, progress: any) {
    const message: IWebSocketProgressMessage = {
      type: 'progress',
      data: progress,
    };
    ws.send(JSON.stringify(message));
  }

  private sendError(ws: WebSocket, message: string) {
    const errorMessage: IWebSocketErrorMessage = {
      type: 'error',
      message,
    };
    ws.send(JSON.stringify(errorMessage));
  }
}
