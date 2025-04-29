import { logger } from '../../utils/logger';
import { ISpace } from './types/ISpace.js';

export const parseMockSpaceObjectsDataFormCoords = (
  mock: ISpace[],
  leftBottomX: number,
  leftBottomY: number,
  rightTopX: number,
  rightTopY: number
): ISpace[] => {
  const spaceObject = mock.filter((item) => {
    if (item.geo === null) {
      return false;
    }
    const { longitude, latitude } = item.geo;

    if (
      longitude > leftBottomX &&
      longitude < rightTopX &&
      latitude > leftBottomY &&
      latitude < rightTopY
    ) {
      return true;
    } else {
      return false;
    }
  });

  return spaceObject;
};
