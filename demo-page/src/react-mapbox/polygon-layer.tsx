import {Polygon} from 'geojson';
import {mapComponent} from './map-component';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {
    PolygonClickProvider,
    PolygonClickProviderOptions,
    polygonRenderer,
    PolygonRendererOptions,
    StaticDataLayer
} from 'mapbox-gl-performance-layers';

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
