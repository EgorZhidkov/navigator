export interface IRoutePoint {
  latitude: number;
  longitude: number;
  order: number;
  isMainPoint: boolean;
  name?: string;
  description?: string;
}

export interface IRouteSegment {
  points: IRoutePoint[];
  distance: number;
  duration: number;
  instructions?: string;
  street?: string;
}

export interface IRouteProgress {
  totalDistance: number;
  remainingDistance: number;
  totalDuration: number;
  remainingDuration: number;
  progressPercentage: number;
  nextMainPoint: IRoutePoint;
  distanceToNextPoint: number;
  estimatedTimeToNextPoint: number;
  currentSegment: IRouteSegment;
}

export interface IRouteOptimizer {
  calculateRoute(points: IRoutePoint[]): Promise<IRouteSegment[]>;
  updateRouteProgress(
    currentLocation: { latitude: number; longitude: number },
    routeSegments: IRouteSegment[]
  ): Promise<IRouteProgress>;
  recalculateRoute(
    currentLocation: { latitude: number; longitude: number },
    remainingPoints: IRoutePoint[]
  ): Promise<IRouteSegment[]>;
}
