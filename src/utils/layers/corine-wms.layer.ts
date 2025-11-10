import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import { croatiaExtent3857 } from '../constants/map-coordinates.constant.ts';

export const corineWmsLayer = new TileLayer({
  source: new TileWMS({
    url: 'https://image.discomap.eea.europa.eu/arcgis/services/Corine/CLC2018_WM/MapServer/WMSServer',
    params: {
      LAYERS: '12',
      FORMAT: 'image/png',
      VERSION: '1.3.0',
    },
    crossOrigin: 'anonymous',
  }),
  visible: false,
  zIndex: 10,
  extent: croatiaExtent3857,
});
