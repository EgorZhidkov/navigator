# Визуализация архитектуры GeoIndexService

## 1. Основная архитектура системы

```mermaid
graph TD
    %% Стили для разных типов компонентов
    classDef database fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef service fill:#2196F3,stroke:#1976D2,color:white,stroke-width:2px
    classDef broker fill:#FF9800,stroke:#F57C00,color:white,stroke-width:2px
    classDef client fill:#9E9E9E,stroke:#616161,color:white,stroke-width:2px
    classDef import fill:#607D8B,stroke:#455A64,color:white,stroke-width:2px

    %% Компоненты системы
    Client[Клиент]:::client
    PostgreSQL[(PostgreSQL)]:::database
    Redis[(Redis)]:::database
    Kafka{{Kafka}}:::broker
    PostgresToKafka[postgres-to-kafka]:::service
    KafkaToRedis[kafka-to-redis]:::service
    Import[Импорт данных]:::import

    %% Связи
    Client --> PostgreSQL
    Client --> Redis
    PostgreSQL --> PostgresToKafka
    PostgresToKafka --> Kafka
    Kafka --> KafkaToRedis
    KafkaToRedis --> Redis
    Import --> PostgreSQL

    %% Легенда
    subgraph Legend
        direction TB
        Database[База данных]:::database
        Service[Сервис]:::service
        Broker[Брокер]:::broker
        ClientLegend[Клиент]:::client
        ImportLegend[Импорт]:::import
    end
```

## 2. Процесс обработки данных

```mermaid
sequenceDiagram
    participant Client as Клиент
    participant PG as PostgreSQL
    participant PTK as postgres-to-kafka
    participant K as Kafka
    participant KTR as kafka-to-redis
    participant R as Redis

    %% Стили
    rect rgb(240, 240, 240)
        Note over Client,R: Процесс добавления нового объекта
    end

    Client->>PG: INSERT INTO places
    activate PG
    PG->>PTK: NOTIFY places_changes
    deactivate PG
    
    activate PTK
    PTK->>K: Отправка в топик places
    deactivate PTK
    
    activate K
    K->>KTR: Получение сообщения
    deactivate K
    
    activate KTR
    KTR->>R: GEOADD places:geo
    KTR->>R: HSET place:{id}
    deactivate KTR
    
    R-->>Client: Готово
```

## 3. Схема данных

```mermaid
erDiagram
    %% Стили
    classDef table fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef field fill:#E8F5E9,stroke:#C8E6C9,color:black,stroke-width:1px
    classDef pk fill:#FFC107,stroke:#FFA000,color:black,stroke-width:1px
    classDef fk fill:#FFE0B2,stroke:#FFB74D,color:black,stroke-width:1px

    %% Таблицы
    places {
        int id PK "Первичный ключ"
        string name "Название"
        geography coordinates "Координаты"
        string description "Описание"
        string opening_hours "Часы работы"
        int type_id FK "ID типа"
    }:::table

    place_types {
        int id PK "Первичный ключ"
        string name "Название"
        string description "Описание"
    }:::table

    %% Связи
    places ||--o{ place_types : "has"
```

## 4. Масштабирование системы

```mermaid
graph TD
    %% Стили
    classDef loadbalancer fill:#9C27B0,stroke:#7B1FA2,color:white,stroke-width:2px
    classDef database fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef cluster fill:#FF9800,stroke:#F57C00,color:white,stroke-width:2px
    classDef app fill:#2196F3,stroke:#1976D2,color:white,stroke-width:2px

    %% Компоненты
    LB[Load Balancer]:::loadbalancer
    
    subgraph PostgreSQL_Cluster
        direction TB
        PG1[(Primary)]:::database
        PG2[(Replica 1)]:::database
        PG3[(Replica 2)]:::database
    end

    subgraph Kafka_Cluster
        direction TB
        K1{{Broker 1}}:::cluster
        K2{{Broker 2}}:::cluster
        K3{{Broker 3}}:::cluster
    end

    subgraph Redis_Cluster
        direction TB
        R1[(Node 1)]:::database
        R2[(Node 2)]:::database
        R3[(Node 3)]:::database
    end

    subgraph Application_Servers
        direction TB
        App1[App Server 1]:::app
        App2[App Server 2]:::app
        App3[App Server 3]:::app
    end

    %% Связи
    LB --> PostgreSQL_Cluster
    LB --> Application_Servers
    PostgreSQL_Cluster --> Kafka_Cluster
    Kafka_Cluster --> Redis_Cluster
    Redis_Cluster --> Application_Servers
```

## 5. Система мониторинга

```mermaid
graph TD
    %% Стили
    classDef monitoring fill:#E91E63,stroke:#C2185B,color:white,stroke-width:2px
    classDef service fill:#2196F3,stroke:#1976D2,color:white,stroke-width:2px
    classDef database fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef broker fill:#FF9800,stroke:#F57C00,color:white,stroke-width:2px

    %% Компоненты
    Prometheus[Prometheus]:::monitoring
    Grafana[Grafana]:::monitoring
    AlertManager[AlertManager]:::monitoring

    PostgreSQL[(PostgreSQL)]:::database
    Redis[(Redis)]:::database
    Kafka{{Kafka}}:::broker
    PTK[postgres-to-kafka]:::service
    KTR[kafka-to-redis]:::service

    %% Метрики
    subgraph Metrics
        direction TB
        PG_Metrics[PostgreSQL Metrics]
        Redis_Metrics[Redis Metrics]
        Kafka_Metrics[Kafka Metrics]
        Service_Metrics[Service Metrics]
    end

    %% Связи
    Prometheus --> PG_Metrics
    Prometheus --> Redis_Metrics
    Prometheus --> Kafka_Metrics
    Prometheus --> Service_Metrics
    
    Grafana --> Prometheus
    AlertManager --> Prometheus

    PG_Metrics --> PostgreSQL
    Redis_Metrics --> Redis
    Kafka_Metrics --> Kafka
    Service_Metrics --> PTK
    Service_Metrics --> KTR
```

## 6. Система резервного копирования

```mermaid
graph TD
    %% Стили
    classDef backup fill:#795548,stroke:#5D4037,color:white,stroke-width:2px
    classDef database fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef storage fill:#607D8B,stroke:#455A64,color:white,stroke-width:2px

    %% Компоненты
    PostgreSQL[(PostgreSQL)]:::database
    Redis[(Redis)]:::database

    subgraph Backup_System
        direction TB
        WAL[WAL Archiving]:::backup
        Base[Base Backup]:::backup
        RDB[RDB Backup]:::backup
        AOF[AOF Backup]:::backup
    end

    subgraph Storage
        direction TB
        Local[Local Storage]:::storage
        Cloud[Cloud Storage]:::storage
        Tape[Tape Archive]:::storage
    end

    %% Связи
    PostgreSQL --> WAL
    PostgreSQL --> Base
    Redis --> RDB
    Redis --> AOF

    WAL --> Local
    Base --> Cloud
    RDB --> Local
    AOF --> Cloud
    Local --> Tape
```

## 7. Расширенная схема данных

```mermaid
erDiagram
    %% Стили
    classDef table fill:#4CAF50,stroke:#388E3C,color:white,stroke-width:2px
    classDef field fill:#E8F5E9,stroke:#C8E6C9,color:black,stroke-width:1px
    classDef pk fill:#FFC107,stroke:#FFA000,color:black,stroke-width:1px
    classDef fk fill:#FFE0B2,stroke:#FFB74D,color:black,stroke-width:1px
    classDef index fill:#BBDEFB,stroke:#90CAF9,color:black,stroke-width:1px

    %% Таблицы
    PLACES {
        int id PK "Первичный ключ"
        string name "Название"
        geography coordinates "Координаты"
        string description "Описание"
        string opening_hours "Часы работы"
        int type_id FK "ID типа"
        timestamp created_at "Дата создания"
        timestamp updated_at "Дата обновления"
        boolean is_active "Активен"
    }

    PLACE_TYPES {
        int id PK "Первичный ключ"
        string name "Название"
        string description "Описание"
        string icon "Иконка"
        int priority "Приоритет"
    }

    PLACE_METADATA {
        int place_id PK,FK "ID места"
        string key "Ключ"
        string value "Значение"
        timestamp updated_at "Дата обновления"
    }

    PLACE_VISITS {
        int id PK "Первичный ключ"
        int place_id FK "ID места"
        timestamp visit_date "Дата посещения"
        int user_id FK "ID пользователя"
        string notes "Заметки"
    }

    %% Связи
    PLACES ||--o{ PLACE_TYPES : "has"
    PLACES ||--o{ PLACE_METADATA : "has"
    PLACES ||--o{ PLACE_VISITS : "has"

    %% Индексы
    PLACES }|--|| coordinates : "GIST"
    PLACES }|--|| name : "BTREE"
    PLACE_VISITS }|--|| visit_date : "BTREE"
``` 