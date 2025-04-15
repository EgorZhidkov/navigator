-- Создание таблицы places, если она не существует
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates geography(Point, 4326) NOT NULL,
    description TEXT,
    opening_hours TEXT,
    type_id INTEGER
);

-- Создание функции для отправки уведомлений
CREATE OR REPLACE FUNCTION notify_places_changes()
RETURNS TRIGGER AS $$
DECLARE
    point_data RECORD;
BEGIN
    IF TG_OP = 'DELETE' THEN
        point_data := OLD;
    ELSE
        point_data := NEW;
    END IF;

    PERFORM pg_notify(
        'places_changes',
        json_build_object(
            'id', point_data.id,
            'name', point_data.name,
            'coordinates', json_build_object(
                'type', 'Point',
                'coordinates', ARRAY[ST_X(point_data.coordinates::geometry), ST_Y(point_data.coordinates::geometry)]
            ),
            'description', point_data.description,
            'opening_hours', point_data.opening_hours,
            'type_id', point_data.type_id,
            'operation', TG_OP,
            'timestamp', CURRENT_TIMESTAMP
        )::text
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера, если он не существует
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'places_changes_trigger'
    ) THEN
        CREATE TRIGGER places_changes_trigger
        AFTER INSERT OR UPDATE OR DELETE ON places
        FOR EACH ROW EXECUTE FUNCTION notify_places_changes();
    END IF;
END $$;