export async function checkIsGeolocationGranted(
  options?: PositionOptions,
): Promise<boolean> {
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      // successfully got location
      () => {
        console.log('checkIsGeolocationGranted->success')
        return resolve(true)
      },
      (error) => {
        console.error('checkIsGeolocationGranted->error', error)
        // permission denied
        if (error.code === error.PERMISSION_DENIED) {
          console.log('checkIsGeolocationGranted->permission denied')
          return resolve(false)
        }

        // position unavailable - это не ошибка, а временная недоступность
        if (error.code === error.POSITION_UNAVAILABLE) {
          console.log(
            'checkIsGeolocationGranted->position unavailable, but continuing',
          )
          return resolve(true)
        }

        // timeout - это не ошибка, а временная недоступность
        if (error.code === error.TIMEOUT) {
          console.log('checkIsGeolocationGranted->timeout, but continuing')
          return resolve(true)
        }

        // some other error
        console.log('checkIsGeolocationGranted->unknown error')
        return resolve(false)
      },
      {
        ...{
          maximumAge: Infinity,
          timeout: 5000, // Увеличиваем таймаут
          enableHighAccuracy: true, // Добавляем высокую точность
        },
        ...options,
      },
    )
  })
}
