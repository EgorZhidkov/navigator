import { makeAutoObservable } from 'mobx'

import { ERequestStatus } from '@/shared'

import type { IRoute } from '../@types'

const STORAGE_KEYS = {
  ACTIVE_TRACK: 'active_track',
  CACHED_ROUTES: 'cached_routes',
} as const

interface ICachedRoute {
  trackId: string | number
  routeData: {
    params: Record<string, unknown>
    referencePoints: number[][]
  }
}

class TrackStore {
  public track: IRoute | null = null
  public baseTracks: IRoute[] = []
  public status: ERequestStatus = ERequestStatus.Pending
  public isOpenTracks: boolean = false
  public isCustomTrackModalOpen: boolean = false
  public yandexTrackDrawing: ymaps.multiRouter.MultiRoute | null = null
  private cachedRoutes: Map<string | number, ICachedRoute> = new Map()

  public constructor() {
    makeAutoObservable(this)
    this.initializeFromStorage()
  }

  private initializeFromStorage(): void {
    // Загружаем активный трек
    const activeTrackStr = localStorage.getItem(STORAGE_KEYS.ACTIVE_TRACK)
    if (activeTrackStr) {
      this.track = JSON.parse(activeTrackStr)
    }

    // Загружаем кэшированные маршруты
    const cachedRoutesStr = localStorage.getItem(STORAGE_KEYS.CACHED_ROUTES)
    if (cachedRoutesStr) {
      const routes = JSON.parse(cachedRoutesStr)
      this.cachedRoutes = new Map(Object.entries(routes))
    }
  }

  private saveToStorage(): void {
    // Сохраняем активный трек
    if (this.track) {
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_TRACK,
        JSON.stringify(this.track),
      )
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_TRACK)
    }

    // Сохраняем кэшированные маршруты
    const routesObj = Object.fromEntries(this.cachedRoutes)
    localStorage.setItem(STORAGE_KEYS.CACHED_ROUTES, JSON.stringify(routesObj))
  }

  public setBaseTracks = (tracks: IRoute[]): void => {
    this.baseTracks = tracks
    this.status = ERequestStatus.Ready
  }

  public setLoading(): void {
    this.status = ERequestStatus.Loading
  }

  public chooseTrack = (track: IRoute | null): void => {
    this.track = track
    this.saveToStorage()
  }

  public clearTrack = (): void => {
    this.track = null
    this.yandexTrackDrawing = null
    this.saveToStorage()
  }

  public toggleTrackWindow = (): void => {
    this.isOpenTracks = !this.isOpenTracks
  }

  public setYandexTrack = (track: ymaps.multiRouter.MultiRoute | null) => {
    this.yandexTrackDrawing = track
    console.log(this.yandexTrackDrawing)
    if (track && this.track) {
      // Кэшируем только необходимые данные маршрута
      const params = track.options.get('params', {})
      const referencePoints = this.track.points!.map((item) => [
        item.place!.coordinates!.latitude,
        item.place!.coordinates!.longitude,
      ])

      this.cachedRoutes.set(this.track.id, {
        trackId: this.track.id,
        routeData: {
          params: params as Record<string, unknown>,
          referencePoints,
        },
      })
      this.saveToStorage()
    }
  }

  public getCachedRoute = (
    trackId: string | number,
  ): ICachedRoute | undefined => {
    return this.cachedRoutes.get(trackId)
  }

  public toggleCustomTrackWindow = (): void => {
    this.isCustomTrackModalOpen = !this.isCustomTrackModalOpen
  }

  public get isLoading(): boolean {
    return this.status === ERequestStatus.Loading
  }

  public get isError(): boolean {
    return this.status === ERequestStatus.Error
  }
}

export const trackStore = new TrackStore()
