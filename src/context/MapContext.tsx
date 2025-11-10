import { createContext, type ReactNode, useMemo, useState } from 'react';
import type Map from 'ol/Map';

type MapContextValue = {
  map: Map | null;
  setMap: (map: Map | null) => void;
};

export const MapContext = createContext<MapContextValue | undefined>(
  undefined,
);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Map | null>(null);

  const value = useMemo(() => ({ map, setMap }), [map]);

  return (
    <MapContext.Provider value={value}>{children}</MapContext.Provider>
  );
}
