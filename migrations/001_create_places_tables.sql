-- Создание таблицы мест
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    coordinates JSONB,
    type_id INTEGER,
    description TEXT,
    opening_hours JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индекса для оптимизации поиска по имени
CREATE INDEX idx_places_name ON places(name);

-- Создание триггера для автоматического обновления updated_at
CREATE TRIGGER update_places_updated_at
    BEFORE UPDATE ON places
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Добавление тестовых данных
INSERT INTO places (name, coordinates, type_id, description) VALUES
    ('АО РКЦ Прогресс', '{"type": "Point", "coordinates": [49.1234, 53.1234]}', 1, 'Ракетно-космический центр'),
    ('ЦНИИМАШ', '{"type": "Point", "coordinates": [49.2345, 53.2345]}', 1, 'Центральный научно-исследовательский институт машиностроения'),
    ('РКС', '{"type": "Point", "coordinates": [49.3456, 53.3456]}', 1, 'Российские космические системы'),
    ('Протон ПМ', '{"type": "Point", "coordinates": [49.4567, 53.4567]}', 1, 'Протон-ПМ'),
    ('НПО им Лавочкина', '{"type": "Point", "coordinates": [49.5678, 53.5678]}', 1, 'Научно-производственное объединение имени С.А. Лавочкина'); 