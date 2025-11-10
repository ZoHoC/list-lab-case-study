import { useContext } from 'react';
import { MapContext } from './MapContext.tsx';

export function useMapContext() {
  const context = useContext(MapContext);

  if (!context)
    throw new Error('useMap must be used within a MapProvider');

  return context;
}
