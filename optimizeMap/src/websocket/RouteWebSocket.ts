import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';
import {
  RouteOptimizer,
  IRoutePoint,
  IRouteSegment,
} from '../Track/RouteOptimizer';
import { Redis } from 'ioredis';
import { logger } from '../utils/logger';

interface IClient {
  ws: WebSocket;
  routeId: number;
  lastLocation?: {
    latitude: number;
    longitude: number;
  };
}

export class RouteWebSocket {
  private wss: WebSocketServer;
  private routeOptimizer: RouteOptimizer;
  private clients: Map<string, IClient>;
  private redis: Redis;

  constructor(server: Server, routeOptimizer: RouteOptimizer, redis: Redis) {
    this.wss = new WebSocketServer({ server });
    this.routeOptimizer = routeOptimizer;
    this.redis = redis;
    this.clients = new Map();
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7);
      logger.info(`New WebSocket connection established: ${clientId}`);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          logger.info(`Received message from ${clientId}:`, data);

          switch (data.type) {
            case 'init':
              await this.handleInit(clientId, ws, data.data);
              break;
            case 'location':
              await this.handleLocation(clientId, data.data);
              break;
          }
        } catch (error) {
          logger.error('Error handling WebSocket message:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Internal server error',
            })
          );
        }
      });

      ws.on('close', () => {
        logger.info(`WebSocket connection closed: ${clientId}`);
        this.clients.delete(clientId);
      });
    });
  }

  private async handleInit(
    clientId: string,
    ws: WebSocket,
    data: { routeId: number }
  ) {
    try {
      logger.info(`Initializing route ${data.routeId} for client ${clientId}`);
      // Получаем маршрут из Redis или базы данных
      const route = await this.getRoute(data.routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      // Сохраняем клиента
      this.clients.set(clientId, {
        ws,
        routeId: data.routeId,
      });

      // Отправляем начальный маршрут
      const segments = await this.routeOptimizer.calculateRoute(route.points);
      ws.send(
        JSON.stringify({
          type: 'route',
          data: { segments },
        })
      );
      logger.info(`Route sent to client ${clientId}`);
    } catch (error) {
      logger.error('Error initializing route:', error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to initialize route',
        })
      );
    }
  }

  private async handleLocation(
    clientId: string,
    location: { latitude: number; longitude: number }
  ) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      logger.info(`Updating location for client ${clientId}:`, location);
      // Обновляем последнюю локацию
      client.lastLocation = location;

      // Получаем текущий маршрут
      const route = await this.getRoute(client.routeId);
      if (!route) return;

      // Обновляем прогресс
      const segments = await this.routeOptimizer.calculateRoute(route.points);
      const progress = await this.routeOptimizer.updateRouteProgress(
        location,
        segments
      );

      // Отправляем обновление клиенту
      client.ws.send(
        JSON.stringify({
          type: 'progress',
          data: progress,
        })
      );
      logger.info(`Progress sent to client ${clientId}`);
    } catch (error) {
      logger.error('Error updating location:', error);
      client.ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Failed to update location',
        })
      );
    }
  }

  private async getRoute(routeId: number) {
    // Сначала пробуем получить из Redis
    const cachedRoute = await this.redis.get(`route:${routeId}`);
    if (cachedRoute) {
      return JSON.parse(cachedRoute);
    }

    // Если нет в кэше, получаем из базы данных
    // TODO: Реализовать получение маршрута из базы данных
    return null;
  }
}
