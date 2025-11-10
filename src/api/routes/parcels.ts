import apiCall from '../api-call.ts';
import { ApiMethods } from '../api.types.ts';

const PARCELS_ROUTE_URL = 'dkp/parcels';
export const PARCELS_QUERY_KEY = PARCELS_ROUTE_URL;

export type ParcelProps = {
  parcel_number: string;
  area: number | string;
  cadastral_municipality: string;
};

export type ServerParcelGeoJSON = {
  type: 'Feature';
  id?: number | string;
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: ParcelProps;
};

export function getParcelById(parcelId: string | number) {
  return apiCall({
    endpoint: `/${PARCELS_ROUTE_URL}/${parcelId}/`,
    method: ApiMethods.GET,
  });
}

export const getParcelByIdQuery = (parcelId: string | number) => {
  return {
    queryKey: [PARCELS_QUERY_KEY, parcelId],
    queryFn: () => getParcelById(parcelId),
  };
};
