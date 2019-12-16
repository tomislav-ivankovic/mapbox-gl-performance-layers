import {Polygon} from 'geojson';
import {mapComponent} from './map-component';
import {StaticDataLayer} from '../../mapbox-gl-fast-layers/static-data/static-data-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {polygonRenderer, PolygonRendererOptions} from '../../mapbox-gl-fast-layers/static-data/renderer-presets/polygon-renderer';
import {PolygonClickProvider, PolygonClickProviderOptions} from '../../mapbox-gl-fast-layers/static-data/click-provider/polygon-click-provider';

export type PolygonLayerProps<P> =
    StaticDataLayerComponentProps<Polygon, P> &
    PolygonRendererOptions<P> &
    PolygonClickProviderOptions<P>;

class Layer<P> extends StaticDataLayerComponent<PolygonLayerProps<P>, {}, Polygon, P> {
    protected constructLayer(): StaticDataLayer<Polygon, P> {
        return new StaticDataLayer(
            this.props.id || `custom-point-${generateID()}`,
            polygonRenderer(this.props),
            new PolygonClickProvider(this.props)
        );
    }
}

export const PolygonLayer = mapComponent(Layer);
