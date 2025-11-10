import type { TegolaCapabilitiesResponse } from '../../api/routes/tegola.ts';

export const CADASTRE_LAYER_NAME = 'cadastral_parcels';

export function findLayerTilesUrl(
  caps: TegolaCapabilitiesResponse,
  layerName: string = CADASTRE_LAYER_NAME,
): string | undefined {
  for (const m of caps.maps ?? []) {
    const layer = (m.layers ?? []).find((l) => l?.name === layerName);
    if (layer && Array.isArray(layer.tiles) && layer.tiles.length > 0) {
      return layer.tiles[0];
    }
  }

  return undefined;
}
