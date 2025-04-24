-- Включаем расширение PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Создание таблицы типов мест
CREATE TABLE IF NOT EXISTS place_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- Создание таблицы places с использованием PostGIS
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates geography(POINT) NOT NULL,
    type_id INTEGER REFERENCES place_types(id),
    description TEXT,
    opening_hours VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для геопространственных запросов
CREATE INDEX IF NOT EXISTS places_coordinates_idx ON places USING GIST (coordinates);

-- Создание функции для триггера
CREATE OR REPLACE FUNCTION notify_places_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'places_changes',
        json_build_object(
            'operation', TG_OP,
            'id', COALESCE(NEW.id, OLD.id),
            'name', COALESCE(NEW.name, OLD.name),
            'coordinates', COALESCE(NEW.coordinates::text, OLD.coordinates::text),
            'type_id', COALESCE(NEW.type_id, OLD.type_id),
            'description', COALESCE(NEW.description, OLD.description),
            'opening_hours', COALESCE(NEW.opening_hours, OLD.opening_hours)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера
DROP TRIGGER IF EXISTS places_changes_trigger ON places;
CREATE TRIGGER places_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE
    ON places
    FOR EACH ROW
    EXECUTE FUNCTION notify_places_changes();

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание таблицы типов маршрутов
CREATE TABLE IF NOT EXISTS route_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы маршрутов
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type_id INTEGER REFERENCES route_types(id),
    author_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы точек маршрута
CREATE TABLE IF NOT EXISTS route_points (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    place_id INTEGER REFERENCES places(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    description TEXT,
    visit_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_route_point_order UNIQUE (route_id, order_index)
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_route_points_route_id ON route_points(route_id);
CREATE INDEX IF NOT EXISTS idx_route_points_place_id ON route_points(place_id);
CREATE INDEX IF NOT EXISTS idx_routes_type_id ON routes(type_id);

-- Создание триггеров для автоматического обновления updated_at
CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_points_updated_at
    BEFORE UPDATE ON route_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_types_updated_at
    BEFORE UPDATE ON route_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Добавление базовых типов маршрутов
INSERT INTO route_types (name, description) VALUES
    ('Образовательный', 'Маршрут для образовательных целей'),
    ('Технический', 'Маршрут по техническим объектам'),
    ('Исторический', 'Маршрут по историческим местам'),
    ('Туристический', 'Маршрут для туристов')
ON CONFLICT (name) DO UPDATE 
    SET description = EXCLUDED.description;

-- Добавление типов мест
INSERT INTO place_types (id, name, description) VALUES 
    (1, 'Достопримечательность', 'Культурные и исторические объекты'),
    (2, 'Парк', 'Зеленые зоны и места отдыха'),
    (3, 'Музей', 'Музеи и выставочные центры')
ON CONFLICT (id) DO UPDATE 
    SET name = EXCLUDED.name,
        description = EXCLUDED.description;

-- Добавление тестовых записей мест
INSERT INTO places (name, coordinates, type_id, description, opening_hours) VALUES
    ('Московский Кремль', 
     ST_SetSRID(ST_MakePoint(37.618423, 55.751244), 4326),
     1,
     'Исторический центр Москвы',
     '10:00-18:00'),
    ('Красная площадь', 
     ST_SetSRID(ST_MakePoint(37.620393, 55.753930), 4326),
     1,
     'Главная площадь Москвы',
     'Круглосуточно'),
    ('Храм Христа Спасителя', 
     ST_SetSRID(ST_MakePoint(37.602778, 55.744722), 4326),
     1,
     'Кафедральный собор Русской православной церкви',
     '08:00-20:00')
ON CONFLICT (name) DO UPDATE 
    SET coordinates = EXCLUDED.coordinates,
        type_id = EXCLUDED.type_id,
        description = EXCLUDED.description,
        opening_hours = EXCLUDED.opening_hours;

-- Комментарий о заполнении данных
COMMENT ON TABLE places IS 'Таблица мест. Данные заполняются через скрипты в директории data:
- data/import_place_types.js - импорт типов мест из place_types.json
- data/import_places.js - импорт мест из places.json
- data/generate_places.js - генерация тестовых данных
- data/generate_places.py - альтернативный скрипт генерации данных на Python'; 