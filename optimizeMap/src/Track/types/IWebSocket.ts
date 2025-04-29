import { IRouteSegment, IRouteProgress } from './IRouteOptimizer';

export interface IWebSocketMessage {
  type: string;
  data?: any;
  message?: string;
}

export interface IWebSocketInitMessage extends IWebSocketMessage {
  type: 'init';
  data: {
    routeId: number;
  };
}

export interface IWebSocketLocationMessage extends IWebSocketMessage {
  type: 'location';
  data: {
    latitude: number;
    longitude: number;
  };
}

export interface IWebSocketRouteMessage extends IWebSocketMessage {
  type: 'route';
  data: {
    segments: IRouteSegment[];
  };
}

export interface IWebSocketProgressMessage extends IWebSocketMessage {
  type: 'progress';
  data: IRouteProgress;
}

export interface IWebSocketErrorMessage extends IWebSocketMessage {
  type: 'error';
  message: string;
}
