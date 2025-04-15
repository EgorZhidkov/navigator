-- Создание таблицы places
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы типов мест
CREATE TABLE IF NOT EXISTS place_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Добавление типа места
INSERT INTO place_types (id, name) VALUES (1, 'Достопримечательность')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Создание функции для триггера
CREATE OR REPLACE FUNCTION notify_places_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'places_changes',
        json_build_object(
            'operation', TG_OP,
            'id', NEW.id,
            'name', NEW.name,
            'coordinates', NEW.coordinates,
            'type_id', NEW.type_id,
            'description', NEW.description,
            'opening_hours', NEW.opening_hours
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

-- Добавление тестовых записей
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
     '08:00-20:00'); 