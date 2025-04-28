import { makeAutoObservable } from 'mobx'

import { trackStore } from './trackStore'

const STORAGE_KEY = 'navigation_state'
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 секунды

interface ISegment {
  coordinates: number[][]
  street: string
  action: string
  length: number
  duration: number
}

interface IRouteData {
  coordinates: number[][]
  segments: ISegment[]
}

interface INavigationState {
  isNavigating: boolean
  currentPosition: [number, number] | null
  currentSegmentIndex: number
  distanceToNextPoint: number
  nextInstruction: string
  remainingDistance: number
  estimatedTime: number
  error: string | null
  retryAttempts: number
}

class NavigationStore {
  public state: INavigationState = {
    isNavigating: false,
    currentPosition: null,
    currentSegmentIndex: 0,
    distanceToNextPoint: 0,
    nextInstruction: '',
    remainingDistance: 0,
    estimatedTime: 0,
    error: null,
    retryAttempts: 0,
  }

  private watchId: number | null = null
  private routeData: IRouteData | null = null
  private retryTimeoutId: number | null = null

  constructor() {
    makeAutoObservable(this)
    this.initializeFromStorage()
  }

  private initializeFromStorage = () => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY)
      if (savedState) {
        const parsedState = JSON.parse(savedState)
        this.state = parsedState
        console.log('parsedState', parsedState)
        // Если была активна навигация, возобновляем её
        if (parsedState.isNavigating && trackStore.yandexTrackDrawing) {
          this.startNavigation()
        }
      }
    } catch (error) {
      console.error('Ошибка при загрузке состояния навигации:', error)
      this.state.error = 'Ошибка при загрузке состояния навигации'
    }
  }

  private saveToStorage = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Ошибка при сохранении состояния навигации:', error)
      this.state.error = 'Ошибка при сохранении состояния навигации'
    }
  }

  private checkGeolocationSupport = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        // Проверяем, действительно ли работает геолокация
        navigator.geolocation.getCurrentPosition(
          () => resolve(true),
          (error) => {
            console.error('Ошибка при проверке геолокации:', error)
            resolve(false)
          },
          { timeout: 5000 },
        )
      } else {
        resolve(false)
      }
    })
  }

  private retryGeolocation = () => {
    if (this.state.retryAttempts < MAX_RETRY_ATTEMPTS) {
      this.state.retryAttempts++
      this.state.error = `Попытка получения геолокации ${this.state.retryAttempts} из ${MAX_RETRY_ATTEMPTS}...`

      // Очищаем предыдущий таймаут, если есть
      if (this.retryTimeoutId) {
        window.clearTimeout(this.retryTimeoutId)
      }

      // Устанавливаем новый таймаут для следующей попытки
      this.retryTimeoutId = window.setTimeout(() => {
        this.startWatchingPosition()
      }, RETRY_DELAY)
    } else {
      this.state.error =
        'Не удалось получить местоположение после нескольких попыток. Проверьте настройки геолокации.'
      this.stopNavigation()
    }
  }

  private startWatchingPosition = () => {
    this.watchId = navigator.geolocation.watchPosition(
      this.handlePositionUpdate,
      this.handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    )
  }

  public startNavigation = async (routeData?: IRouteData) => {
    try {
      // Проверяем поддержку геолокации
      const isGeolocationSupported = await this.checkGeolocationSupport()
      if (!isGeolocationSupported) {
        throw new Error(
          'Геолокация недоступна. Пожалуйста, проверьте настройки браузера и разрешите доступ к местоположению.',
        )
      }
      console.log('routeData', routeData)
      if (routeData) {
        // Проверяем валидность данных маршрута
        if (!routeData.coordinates?.length || !routeData.segments?.length) {
          throw new Error('Некорректные данные маршрута')
        }
        this.routeData = routeData
      }

      if (!this.routeData) {
        throw new Error('Отсутствуют данные маршрута')
      }

      this.state.isNavigating = true
      this.state.error = null
      this.state.retryAttempts = 0

      // Запускаем отслеживание местоположения
      this.startWatchingPosition()
      this.saveToStorage()
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка'
      console.error('Ошибка при запуске навигации:', errorMessage)
      this.state.error = `Ошибка при запуске навигации: ${errorMessage}`
      this.stopNavigation()
    }
  }

  public stopNavigation = () => {
    try {
      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId)
        this.watchId = null
      }

      if (this.retryTimeoutId) {
        window.clearTimeout(this.retryTimeoutId)
        this.retryTimeoutId = null
      }

      this.state.isNavigating = false
      this.state.currentPosition = null
      this.routeData = null
      this.state.error = null
      this.state.retryAttempts = 0
      this.saveToStorage()
    } catch (error) {
      console.error('Ошибка при остановке навигации:', error)
      this.state.error = 'Ошибка при остановке навигации'
    }
  }

  private handlePositionUpdate = (position: GeolocationPosition) => {
    try {
      const newPosition: [number, number] = [
        position.coords.latitude,
        position.coords.longitude,
      ]
      this.state.currentPosition = newPosition
      this.updateNavigationState(newPosition)
      this.saveToStorage()

      // Сбрасываем счетчик попыток при успешном получении позиции
      if (this.state.retryAttempts > 0) {
        this.state.retryAttempts = 0
        this.state.error = null
      }
    } catch (error) {
      console.error('Ошибка при обновлении позиции:', error)
      this.state.error = 'Ошибка при обновлении позиции'
    }
  }

  private handlePositionError = (error: GeolocationPositionError) => {
    let errorMessage = 'Ошибка получения геолокации'

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage =
          'Доступ к геолокации запрещен. Пожалуйста, разрешите доступ к местоположению в настройках браузера.'
        this.stopNavigation()
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage =
          'Информация о местоположении недоступна. Проверьте подключение к интернету и GPS.'
        this.retryGeolocation()
        break
      case error.TIMEOUT:
        errorMessage =
          'Превышено время ожидания при получении местоположения. Пробуем снова...'
        this.retryGeolocation()
        break
    }

    console.error(errorMessage, error)
    this.state.error = errorMessage
  }

  private updateNavigationState = (position: [number, number]) => {
    try {
      if (!this.routeData) {
        throw new Error('Отсутствуют данные маршрута')
      }

      let minDistance = Infinity
      let closestPointIndex = 0

      // Находим ближайшую точку на маршруте
      this.routeData.coordinates.forEach((point, index) => {
        const distance = this.calculateDistance(position, [point[1], point[0]])
        if (distance < minDistance) {
          minDistance = distance
          closestPointIndex = index
        }
      })

      // Определяем текущий сегмент
      let closestSegmentIndex = 0
      let accumulatedPoints = 0
      for (let i = 0; i < this.routeData.segments.length; i++) {
        accumulatedPoints += this.routeData.segments[i].coordinates.length
        if (closestPointIndex < accumulatedPoints) {
          closestSegmentIndex = i
          break
        }
      }

      // Обновляем состояние навигации
      this.state.currentSegmentIndex = closestSegmentIndex
      this.state.distanceToNextPoint = minDistance

      // Вычисляем оставшееся расстояние и время
      let remainingDistance = 0
      let remainingTime = 0
      for (
        let i = closestSegmentIndex;
        i < this.routeData.segments.length;
        i++
      ) {
        remainingDistance += this.routeData.segments[i].length || 0
        remainingTime += this.routeData.segments[i].duration || 0
      }

      this.state.remainingDistance = remainingDistance
      this.state.estimatedTime = Math.round(remainingTime) // время уже в минутах

      // Обновляем инструкцию
      const currentSegment = this.routeData.segments[closestSegmentIndex]
      this.state.nextInstruction = `${currentSegment.action} ${
        currentSegment.street ? `по ${currentSegment.street}` : ''
      }`

      this.state.error = null
      this.saveToStorage()
    } catch (error) {
      console.error('Ошибка при обновлении состояния навигации:', error)
      this.state.error = 'Ошибка при обновлении состояния навигации'
    }
  }

  private calculateDistance = (
    point1: [number, number],
    point2: [number, number],
  ): number => {
    const R = 6371e3 // радиус Земли в метрах
    const φ1 = (point1[0] * Math.PI) / 180
    const φ2 = (point2[0] * Math.PI) / 180
    const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180
    const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }
}

export const navigationStore = new NavigationStore()
