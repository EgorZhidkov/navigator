# Map Filters Feature

## Интеграция с RemoteObjectManager

### Предложенное решение для обновления данных на карте при изменении фильтров

1. Добавить в `mapFiltersStore` метод формирования параметров фильтров:

```typescript
class MapFiltersStore {
  // ... существующий код ...

  public getFilterParams = (): string => {
    const activeFilters = this.activeFilters
    if (!activeFilters.length) return ''

    const params = activeFilters.map(([key, value]) => {
      if (Array.isArray(value)) {
        // Для массивов (checkbox или range)
        return `${key}=${value.join(',')}`
      }
      return `${key}=${value}`
    })

    return `&${params.join('&')}`
  }
}
```

2. Обновить компонент `FeatureOnMap` для реакции на изменение фильтров:

```typescript
const FeatureOnMap: FC<FeatureOnMapProps> = observer(({ ymaps }) => {
  const map = useYandexMap()
  const { selectFeature } = featureYandexMapStore
  
  // Храним ссылку на ObjectManager
  const objectManagerRef = useRef<ObjectManager | null>(null)

  useEffect(() => {
    if (!map || !ymaps) return

    const remoteObjectManager = new ymaps.RemoteObjectManager(
      // Базовый URL с плейсхолдером для фильтров
      `http://localhost:8090/api/v1/maps/get-elements?bbox=%b&zoom=%z${mapFiltersStore.getFilterParams()}`,
      {
        // ... существующие опции ...
      }
    )
    
    objectManagerRef.current = remoteObjectManager

    // ... существующий код с обработкой кликов ...

    // Реакция на изменение фильтров
    const disposer = reaction(
      // Следим за активными фильтрами
      () => mapFiltersStore.activeFilters,
      () => {
        if (objectManagerRef.current) {
          // Обновляем URL с новыми параметрами фильтров
          objectManagerRef.current.setUrlTemplate(
            `http://localhost:8090/api/v1/maps/get-elements?bbox=%b&zoom=%z${mapFiltersStore.getFilterParams()}`
          )
          // Перезагружаем данные
          objectManagerRef.current.reload()
        }
      }
    )

    mapObjectsStore.addObject(
      EMapObjectsType.objectManager,
      remoteObjectManager,
      map
    )

    return () => {
      disposer() // Очищаем reaction
      mapObjectsStore.removeObject(EMapObjectsType.objectManager, map)
    }
  }, [ymaps, map, selectFeature])

  return null
})
```

### Преимущества подхода:

1. Используем реактивность MobX для автоматического обновления данных
2. Не храним лишние данные на клиенте - фильтрация происходит на сервере
3. Переиспользуем существующий механизм RemoteObjectManager
4. Не нужно вручную управлять состоянием объектов на карте

### Требования к бэкенду:

Эндпоинт `/api/v1/maps/get-elements` должен поддерживать параметры фильтрации:
- Принимать параметры фильтров в URL
- Возвращать только отфильтрованные объекты
- Поддерживать различные типы фильтров (checkbox, radio, range)

### Пример URL с фильтрами:

```
http://localhost:8090/api/v1/maps/get-elements?bbox=...&zoom=...&objectType=satellite,station&status=active&altitude=100,500
``` 