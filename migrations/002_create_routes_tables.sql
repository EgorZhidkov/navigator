-- Создание таблицы типов маршрутов
CREATE TABLE route_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы маршрутов
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type_id INTEGER REFERENCES route_types(id),
    author_id INTEGER, -- В будущем можно добавить таблицу пользователей
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы точек маршрута
CREATE TABLE route_points (
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
CREATE INDEX idx_route_points_route_id ON route_points(route_id);
CREATE INDEX idx_route_points_place_id ON route_points(place_id);
CREATE INDEX idx_routes_type_id ON routes(type_id);

-- Добавление базовых типов маршрутов
INSERT INTO route_types (name, description) VALUES
    ('Образовательный', 'Маршрут для образовательных целей'),
    ('Технический', 'Маршрут по техническим объектам'),
    ('Исторический', 'Маршрут по историческим местам'),
    ('Туристический', 'Маршрут для туристов');

-- Создание триггера для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

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