import { type FC, useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { useMapContext } from '../../../context';
import 'ol/ol.css';
import {
  croatiaExtent3857,
  STARTING_POSITION,
} from '../../../utils/constants/map-coordinates.constant.ts';
import { EPSG } from '../../../utils/constants/epsg.constant.ts';
import { corineWmsLayer } from '../../../utils/layers/corine-wms.layer.ts';
import CadastralParcelsLayer from '../../molecules/CadastralParcelsLayer';

type MapViewProps = {
  startingZoom: 8 | 10 | 12 | 14 | 16;
};

const MapView: FC<MapViewProps> = ({ startingZoom }) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const { setMap } = useMapContext();
  const [wmsVisible, setWmsVisible] = useState<boolean>(
    corineWmsLayer.getVisible(),
  );

  useEffect(() => {
    if (!mapDivRef.current) return;

    const osm = new TileLayer({
      source: new OSM({ wrapX: false }),
      zIndex: 0,
    });

    const view = new View({
      projection: EPSG.WEB_MERCATOR,
      center: fromLonLat(STARTING_POSITION),
      zoom: startingZoom,
      extent: croatiaExtent3857,
    });

    const map = new Map({
      target: mapDivRef.current,
      layers: [osm, corineWmsLayer],
      view,
    });

    const onVis = () => setWmsVisible(corineWmsLayer.getVisible());
    corineWmsLayer.on('change:visible', onVis);

    setMap(map);

    return () => {
      corineWmsLayer.un('change:visible', onVis);
      map.setTarget(undefined);
      setMap(null);
    };
  }, [setMap, startingZoom]);

  const toggleWms = () => {
    const next = !wmsVisible;

    corineWmsLayer.setVisible(next);
    setWmsVisible(next);
  };

  return (
    <div className='w-screen h-screen overflow-hidden'>
      <div className='w-full h-full relative'>
        <div ref={mapDivRef} className='w-full h-full' />

        <button
          type='button'
          className='absolute top-3 left-10 z-50 rounded !p-1 bg-white/90 backdrop-blur text-sm shadow border cursor-pointer'
          onClick={toggleWms}
          aria-pressed={wmsVisible}
          title='Toggle CORINE WMS'
        >
          {wmsVisible ? 'Hide CORINE' : 'Show CORINE'}
        </button>
      </div>
      <CadastralParcelsLayer />
    </div>
  );
};

export default MapView;
