-- Создание таблицы places, если она не существует
CREATE TABLE IF NOT EXISTS places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    description TEXT,
    opening_hours TEXT,
    type_id INTEGER
);

-- Создание функции для отправки уведомлений
CREATE OR REPLACE FUNCTION notify_places_changes()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'places_changes',
        json_build_object(
            'id', COALESCE(NEW.id, OLD.id),
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