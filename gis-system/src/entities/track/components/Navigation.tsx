import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'

import { navigationStore } from '../models/store/navigationStore'
import { trackStore } from '../models/store/trackStore'

export const Navigation = observer(() => {
  const {
    isNavigating,
    currentPosition,
    currentSegmentIndex,
    distanceToNextPoint,
    remainingDistance,
    estimatedTime,
    error,
  } = navigationStore.state

  const { yandexTrackDrawing } = trackStore

  const currentPoint = trackStore.track?.points[currentSegmentIndex]
  const nextPoint = trackStore.track?.points[currentSegmentIndex + 1] || null
  const progress =
    ((currentSegmentIndex + 1) / (trackStore.track?.points.length || 1)) * 100

  useEffect(() => {
    if (yandexTrackDrawing && !isNavigating) {
      // Запускаем навигацию только если она еще не запущена
      navigationStore.startNavigation()
    }
  }, [yandexTrackDrawing, isNavigating])

  if (!trackStore.track) return null

  return (
    <div
      className="navigation-overlay"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        width: '320px',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Заголовок */}
      <div
        style={{
          marginBottom: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ margin: 0, color: '#1976D2', fontSize: '18px' }}>
          Навигация
        </h3>
        <span
          style={{
            background: '#E3F2FD',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#1976D2',
          }}
        >
          {Math.round(progress)}%
        </span>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div
          style={{
            background: '#FFEBEE',
            color: '#D32F2F',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Прогресс-бар */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            height: '8px',
            background: '#E3F2FD',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2196F3, #1976D2)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Текущая точка */}
      {currentPoint && (
        <div
          style={{
            background: '#F5F5F5',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '5px',
            }}
          >
            Текущая точка:
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#1976D2',
            }}
          >
            {currentPoint.title}
          </div>
        </div>
      )}

      {/* Следующая точка */}
      {nextPoint && (
        <div
          style={{
            background: '#FFF3E0',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '5px',
            }}
          >
            Следующая точка:
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#E65100',
            }}
          >
            {nextPoint.title}
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#666',
              marginTop: '5px',
            }}
          >
            {Math.round(distanceToNextPoint / 1000)} км
          </div>
        </div>
      )}

      {/* Информация о маршруте */}
      {isNavigating && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '15px',
          }}
        >
          <div
            style={{
              background: '#E8F5E9',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666' }}>Осталось</div>
            <div
              style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E7D32' }}
            >
              {Math.round(remainingDistance / 1000)} км
            </div>
          </div>
          <div
            style={{
              background: '#E8F5E9',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', color: '#666' }}>Время</div>
            <div
              style={{ fontSize: '16px', fontWeight: 'bold', color: '#2E7D32' }}
            >
              {Math.round(estimatedTime)} мин
            </div>
          </div>
        </div>
      )}

      {/* Координаты */}
      {currentPosition && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'center',
            marginBottom: '15px',
          }}
        >
          {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
        </div>
      )}

      {/* Кнопки управления */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {!isNavigating ? (
          <button
            onClick={() => navigationStore.startNavigation()}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background 0.2s ease',
            }}
          >
            Начать навигацию
          </button>
        ) : (
          <button
            onClick={navigationStore.stopNavigation}
            style={{
              background: '#EF5350',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background 0.2s ease',
            }}
          >
            Остановить навигацию
          </button>
        )}
      </div>
    </div>
  )
})
