-- Миграция существующих маршрутов
DO $$
DECLARE
    route_id integer;
BEGIN
    -- Создаем технический маршрут
    INSERT INTO routes (name, description, type_id)
    SELECT 'Технический маршрут', 'Маршрут по техническим объектам Роскосмоса', id
    FROM route_types
    WHERE name = 'Технический'
    LIMIT 1
    RETURNING id INTO route_id;

    -- Добавляем точки маршрута
    INSERT INTO route_points (route_id, place_id, order_index, description)
    SELECT 
        route_id,
        p.id,
        ROW_NUMBER() OVER (ORDER BY p.id),
        'Технический объект'
    FROM places p
    WHERE p.name IN (
        'АО РКЦ Прогресс',
        'ЦНИИМАШ',
        'РКС',
        'Протон ПМ'
    );

    -- Создаем образовательный маршрут
    INSERT INTO routes (name, description, type_id)
    SELECT 'Образовательный маршрут', 'Маршрут для образовательных целей', id
    FROM route_types
    WHERE name = 'Образовательный'
    LIMIT 1
    RETURNING id INTO route_id;

    -- Добавляем точки маршрута
    INSERT INTO route_points (route_id, place_id, order_index, description)
    SELECT 
        route_id,
        p.id,
        ROW_NUMBER() OVER (ORDER BY p.id),
        'Образовательный объект'
    FROM places p
    WHERE p.name IN (
        'ЦНИИМАШ',
        'РКС',
        'НПО им Лавочкина'
    );
END $$; 