import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import type { FeatureLike } from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import Overlay from 'ol/Overlay';
import { useMapContext } from '../../../context';
import { getTegolaCapabilitiesQuery } from '../../../api/routes/tegola.ts';
import {
  CADASTRE_LAYER_NAME,
  findLayerTilesUrl,
} from '../../../utils/functions/find-layer-tiles-url.function.ts';
import {
  getParcelByIdQuery,
  type ParcelProps,
} from '../../../api/routes/parcels.ts';
import { getMvtFeatureId } from '../../../utils/functions/get-mvt-feature-id.ts';

const defaultStyle = new Style({
  fill: new Fill({ color: 'rgba(0, 120, 255, 0.15)' }),
  stroke: new Stroke({ color: 'rgba(0, 120, 255, 0.9)', width: 1 }),
});

const selectedStyle = new Style({
  fill: new Fill({ color: 'rgba(255, 180, 0, 0.25)' }),
  stroke: new Stroke({ color: 'rgba(255, 140, 0, 1)', width: 2 }),
});

export default function CadastralParcelsLayer() {
  const { map } = useMapContext();

  const {
    data: caps,
    isError,
    error,
  } = useQuery(getTegolaCapabilitiesQuery());

  const tilesUrl = useMemo(
    () =>
      caps ? findLayerTilesUrl(caps, CADASTRE_LAYER_NAME) : undefined,
    [caps],
  );

  const vtLayerRef = useRef<VectorTileLayer<VectorTileSource> | null>(
    null,
  );
  const overlayRef = useRef<Overlay | null>(null);

  const popupElRef = useRef<HTMLDivElement | null>(null);

  const [selected, setSelected] = useState<{
    id: string | number;
    coordinate: [number, number];
  } | null>(null);
  const selectedRef = useRef<typeof selected>(null);

  const {
    data: parcel,
    isLoading,
    isError: isParcelError,
  } = useQuery({
    ...(selected
      ? getParcelByIdQuery(selected.id)
      : { queryKey: ['noop'], queryFn: async () => null }),
    enabled: !!selected,
  });

  const layerStyleFn = (feature: FeatureLike) => {
    const fid = getMvtFeatureId(feature);
    if (fid !== null && selectedRef.current?.id === fid)
      return selectedStyle;
    return defaultStyle;
  };

  const applySelection = useCallback(
    (
      next: { id: string | number; coordinate: [number, number] } | null,
    ) => {
      selectedRef.current = next;
      setSelected(next);

      const layer = vtLayerRef.current;
      const overlay = overlayRef.current;
      const el = popupElRef.current;

      if (overlay && el) {
        if (next) {
          overlay.setPosition(next.coordinate);
          el.style.display = 'block';
        } else {
          overlay.setPosition(undefined);
          el.style.display = 'none';
        }
      }

      if (layer) layer.changed();
    },
    [],
  );

  useEffect(() => {
    if (!map || !tilesUrl || !popupElRef.current) return;

    const source = new VectorTileSource({
      format: new MVT(),
      url: tilesUrl,
      wrapX: false,
    });

    const vtLayer = new VectorTileLayer({
      source,
      style: layerStyleFn,
      declutter: true,
      zIndex: 20,
      visible: true,
    });
    vtLayerRef.current = vtLayer;
    map.addLayer(vtLayer);

    const overlay = new Overlay({
      element: popupElRef.current,
      autoPan: { animation: { duration: 200 } },
      positioning: 'bottom-center',
      stopEvent: true,
      offset: [0, -8],
    });
    overlayRef.current = overlay;
    map.addOverlay(overlay);

    const target = map.getTargetElement() as HTMLElement;
    let hoverScheduled = false;

    const handleMove = (e: any) => {
      const evt = e as MapBrowserEvent<PointerEvent>;
      if (hoverScheduled) return;
      hoverScheduled = true;

      requestAnimationFrame(() => {
        hoverScheduled = false;

        (vtLayer as VectorTileLayer<VectorTileSource>)
          .getFeatures(evt.pixel)
          .then((features) => {
            const hit = features && features.length > 0;
            target.style.cursor = hit ? 'pointer' : '';
          })
          .catch(() => {
            target.style.cursor = '';
          });
      });
    };
    map.on('pointermove', handleMove);

    const handleClick = (e: any) => {
      const evt = e as MapBrowserEvent<PointerEvent>;
      (vtLayer as VectorTileLayer<VectorTileSource>)
        .getFeatures(evt.pixel)
        .then((features) => {
          const clickedFeature = features?.[0] ?? null;
          if (clickedFeature) {
            const id = getMvtFeatureId(clickedFeature);
            if (id !== null) {
              applySelection({
                id,
                coordinate: evt.coordinate as [number, number],
              });
            } else {
              applySelection(null);
            }
          } else {
            applySelection(null);
          }
        })
        .catch(() => applySelection(null));
    };
    map.on('singleclick', handleClick);

    return () => {
      map.un('pointermove', handleMove);
      map.un('singleclick', handleClick);
      (map.getTargetElement() as HTMLElement).style.cursor = '';
      if (overlay) map.removeOverlay(overlay);
      overlayRef.current = null;

      if (vtLayer) map.removeLayer(vtLayer);
      vtLayerRef.current = null;
    };
  }, [map, tilesUrl, applySelection]);

  if (isError) {
    console.error('Tegola capabilities fetch failed:', error);
  }

  const props: ParcelProps | undefined = parcel?.properties;
  const parcelNumber = props?.parcel_number ?? '—';
  const municipality = props?.cadastral_municipality ?? '—';
  const areaLabel = props?.area
    ? `${Number(props.area).toFixed(2)} m²`
    : '—';

  return (
    <div
      ref={popupElRef}
      style={{ display: 'none' }}
      onClick={(e) => e.stopPropagation()}
      className='pointer-events-auto cursor-default'
    >
      <div className='rounded-lg shadow-lg bg-white p-3 min-w-64 max-w-80'>
        <div className='flex justify-between items-start gap-3'>
          <h3 className='font-semibold text-sm'>Parcel details</h3>
          <button
            type='button'
            onClick={() => applySelection(null)}
            className='text-xs !p-1 border rounded cursor-pointer'
            aria-label='Close'
          >
            ✕
          </button>
        </div>

        <div className='mt-2 text-sm'>
          {isLoading && <div>Loading…</div>}
          {!isLoading && isParcelError && (
            <div className='text-red-600'>Failed to load parcel.</div>
          )}

          {!isLoading && !isParcelError && selected && parcel && (
            <div className='space-y-1'>
              <div>
                <span className='font-medium'>Parcel:</span> {parcelNumber}
              </div>
              <div>
                <span className='font-medium'>Area:</span> {areaLabel}
              </div>
              <div>
                <span className='font-medium'>Municipality:</span>{' '}
                {municipality}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
