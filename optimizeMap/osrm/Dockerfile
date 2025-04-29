FROM osrm/osrm-backend:latest

# Копируем карту Москвы
COPY moscow.osm.pbf /data/

# Создаем OSRM файлы
RUN osrm-extract -p /opt/car.lua /data/moscow.osm.pbf && \
    osrm-partition /data/moscow.osrm && \
    osrm-customize /data/moscow.osrm

# Запускаем OSRM сервер
CMD ["osrm-routed", "--algorithm", "mld", "/data/moscow.osrm"] 