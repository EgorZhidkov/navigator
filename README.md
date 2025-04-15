# GeoIndexService

Сервис для индексации географических объектов с использованием PostgreSQL, Kafka и Redis.

## Архитектура

Сервис состоит из следующих компонентов:

1. **PostgreSQL** - основная база данных для хранения информации о местах
2. **Kafka** - брокер сообщений для передачи изменений из PostgreSQL в Redis
3. **Redis** - хранилище для быстрого поиска мест по координатам
4. **postgres-to-kafka** - сервис для отслеживания изменений в PostgreSQL и отправки их в Kafka
5. **kafka-to-redis** - сервис для получения сообщений из Kafka и сохранения их в Redis

## Функциональность

- Хранение информации о местах в PostgreSQL с поддержкой PostGIS
- Автоматическая синхронизация изменений с Redis через Kafka
- Быстрый поиск мест по координатам с использованием Redis GEO
- REST API для работы с местами

## Запуск

```bash
docker compose up --build -d
```

## API Endpoints

### Places

- `GET /places` - получение списка мест
- `GET /places/{id}` - получение информации о месте
- `POST /places` - создание нового места
- `PUT /places/{id}` - обновление информации о месте
- `DELETE /places/{id}` - удаление места

### Geo Search

- `GET /places/nearby?lat={latitude}&lon={longitude}&radius={radius}` - поиск мест в радиусе от заданной точки

## Мониторинг

- Redis Commander: http://localhost:8081
- Kafka UI: http://localhost:8080 