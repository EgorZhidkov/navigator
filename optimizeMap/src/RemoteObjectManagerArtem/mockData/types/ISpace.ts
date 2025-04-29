export interface ISpace {
  id: number;
  system_id: string;
  title: string;
  info: string;
  photo: string[];
  geo: {
    latitude: number;
    longitude: number;
  };
}
