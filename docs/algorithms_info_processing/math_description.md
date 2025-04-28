# Математическое описание алгоритмов обработки информации

## 1. Геометрические вычисления

### 1.1. Расстояние между двумя точками (WGS84)

Формула гаверсинуса:

\[
d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\varphi_2-\varphi_1}{2}\right) + \cos\varphi_1 \cos\varphi_2 \sin^2\left(\frac{\lambda_2-\lambda_1}{2}\right)}\right)
\]

Где:
- \(\varphi_1, \varphi_2\) — широты (в радианах)
- \(\lambda_1, \lambda_2\) — долготы (в радианах)
- \(R\) — радиус Земли (≈ 6371 км)

### 1.2. Проверка попадания точки в полигон

Используется алгоритм луча (Ray Casting) или функции PostGIS/Turf.js:
- В PostGIS: `ST_Contains(polygon, point)`
- В Turf.js: `booleanPointInPolygon(point, polygon)`

## 2. Кластеризация объектов (Grid-based)

Псевдокод:
```
for each object in objects:
    cell = getGridCell(object.coordinates)
    clusters[cell].append(object)
```

## 3. Построение маршрута (эвристика)

Псевдокод (жадный алгоритм):
```
route = [start]
while unvisited_points:
    next_point = findNearest(route[-1], unvisited_points)
    route.append(next_point)
    unvisited_points.remove(next_point)
```

## 4. Поиск ближайших объектов

- Redis: GEOADD, GEORADIUS
- PostGIS: `ST_DWithin`, `ST_Distance`

## 5. Оценка ресурсов

- Оценка памяти: \(N_{places} \times S_{place}\), где \(S_{place}\) — средний размер объекта
- Время отклика: \(O(\log N)\) для поиска по индексу

## 6. Безопасность (формализация)

- Конфиденциальность: \(\forall user, \neg access(user, data)\) без авторизации
- Целостность: \(\forall op, valid(op) \implies consistent(data)\)
- Доступность: \(\forall t, \exists response(t)\) при отказе части компонентов 