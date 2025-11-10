import { transformExtent } from 'ol/proj';
import { EPSG } from './epsg.constant.ts';

export const STARTING_POSITION: [number, number] = [16.419, 46.209];

export const CROATIA_BOUNDING_BOX: [number, number, number, number] = [
  13.0, 42.15, 19.49, 46.6,
];

export const croatiaExtent3857 = transformExtent(
  CROATIA_BOUNDING_BOX,
  EPSG.WGS84,
  EPSG.WEB_MERCATOR,
);
