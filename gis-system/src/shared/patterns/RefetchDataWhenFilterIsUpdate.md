# RefetchDataWhenFilterIsUpdate Pattern

## Описание
Паттерн для автоматического обновления данных при изменении фильтров, используя реактивность MobX и механизм перезагрузки данных.

## Когда использовать
- Когда нужно обновлять данные в реальном времени при изменении фильтров
- Когда фильтрация должна происходить на стороне сервера
- Когда используется MobX для управления состоянием
- Когда есть механизм загрузки данных, поддерживающий обновление URL и перезагрузку

## Структура

### 1. Store с фильтрами
```typescript
class FiltersStore {
  // Состояние фильтров
  public filters: Filter[] = []
  public selectedFilters: Record<string, FilterValue> = {}

  // Метод для формирования параметров запроса
  public getQueryParams = (): string => {
    const activeFilters = this.getActiveFilters()
    if (!activeFilters.length) return ''

    return this.formatFiltersToQueryString(activeFilters)
  }

  // Методы обновления фильтров
  public updateFilter = (filterId: string, value: FilterValue): void => {
    this.selectedFilters[filterId] = value
  }

  public resetFilters = (): void => {
    this.selectedFilters = {}
  }
}
```

### 2. Компонент с данными
```typescript
const DataComponent = observer(() => {
  // Храним ссылку на менеджер данных
  const dataManagerRef = useRef<DataManager | null>(null)

  useEffect(() => {
    // Инициализация менеджера данных
    const dataManager = new DataManager(
      `${BASE_URL}?${filtersStore.getQueryParams()}`
    )
    dataManagerRef.current = dataManager

    // Реакция на изменение фильтров
    const disposer = reaction(
      // Следим за изменениями в фильтрах
      () => filtersStore.getQueryParams(),
      (queryParams) => {
        if (dataManagerRef.current) {
          // Обновляем URL
          dataManagerRef.current.setUrl(
            `${BASE_URL}?${queryParams}`
          )
          // Перезагружаем данные
          dataManagerRef.current.reload()
        }
      }
    )

    return () => {
      disposer() // Очищаем reaction
      // Очистка менеджера данных
      if (dataManagerRef.current) {
        dataManagerRef.current.destroy()
      }
    }
  }, []) // Пустой массив зависимостей, т.к. reaction следит за изменениями

  return null
})
```

## Преимущества
1. **Автоматическое обновление**: Данные обновляются автоматически при изменении фильтров
2. **Серверная фильтрация**: Снижает нагрузку на клиент
3. **Чистый код**: Логика обновления данных изолирована и переиспользуема
4. **Производительность**: Минимизирует количество перерисовок компонентов

## Недостатки
1. **Зависимость от MobX**: Паттерн тесно связан с MobX
2. **Сетевой трафик**: Каждое изменение фильтра вызывает новый запрос
3. **Состояние загрузки**: Требуется дополнительная обработка состояния загрузки

## Рекомендации по использованию
1. Добавьте дебаунс для частых изменений фильтров
2. Реализуйте обработку ошибок загрузки
3. Добавьте индикаторы загрузки
4. Рассмотрите кэширование результатов
5. Используйте TypeScript для типизации фильтров и данных

## Пример использования с Яндекс Картами
```typescript
// Пример из проекта с RemoteObjectManager
const MapComponent = observer(() => {
  const objectManagerRef = useRef<ObjectManager | null>(null)

  useEffect(() => {
    const objectManager = new ymaps.RemoteObjectManager(
      `${API_URL}?bbox=%b&zoom=%z${mapFiltersStore.getQueryParams()}`
    )
    objectManagerRef.current = objectManager

    const disposer = reaction(
      () => mapFiltersStore.getQueryParams(),
      (queryParams) => {
        if (objectManagerRef.current) {
          objectManagerRef.current.setUrlTemplate(
            `${API_URL}?bbox=%b&zoom=%z${queryParams}`
          )
          objectManagerRef.current.reload()
        }
      }
    )

    return () => {
      disposer()
      if (objectManagerRef.current) {
        objectManagerRef.current.destroy()
      }
    }
  }, [])

  return null
})
```

## Связанные паттерны
- Observer Pattern (через MobX)
- Repository Pattern (для работы с данными)
- Factory Pattern (для создания менеджеров данных) 