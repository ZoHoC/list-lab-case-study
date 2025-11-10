import apiCall from '../api-call.ts';
import { ApiMethods } from '../api.types.ts';

const TEGOLA_ROUTE_URL = 'tegola';
export const TEGOLA_QUERY_KEY = TEGOLA_ROUTE_URL;

export type TegolaLayer = {
  name: string;
  tiles: string[];
  minzoom: number;
  maxzoom: number;
};

export type TegolaMap = {
  name: string;
  attribution: string;
  bounds: [number, number, number, number];
  center: [number, number, number];
  tiles: string[];
  capabilities: string;
  layers: TegolaLayer[];
};

export type TegolaCapabilitiesResponse = {
  version: string;
  maps: TegolaMap[];
};

export const getTegolaCapabilities = () => {
  return apiCall({
    endpoint: `/${TEGOLA_ROUTE_URL}/tegola-capabilities`,
    method: ApiMethods.GET,
  });
};

export const getTegolaCapabilitiesQuery = () => {
  return {
    queryKey: [TEGOLA_QUERY_KEY],
    queryFn: () => getTegolaCapabilities(),
  };
};
