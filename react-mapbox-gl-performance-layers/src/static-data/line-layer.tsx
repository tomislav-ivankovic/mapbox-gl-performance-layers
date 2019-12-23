import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {LineString} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {
    LineClickProvider,
    LineClickProviderOptions,
    lineRenderer,
    LineRendererOptions,
    StaticDataLayer
} from 'mapbox-gl-performance-layers';

export type LineLayerProps<P> =
    StaticDataLayerComponentProps<LineString, P> &
    LineRendererOptions<P> &
    LineClickProviderOptions<P>;

class Layer<P> extends StaticDataLayerComponent<LineLayerProps<P>, {}, LineString, P> {
    protected constructLayer(): StaticDataLayer<LineString, P> {
        return new StaticDataLayer(
            this.props.id || `custom-line-${generateID()}`,
            lineRenderer(this.props),
            new LineClickProvider(this.props)
        );
    }
}

export const LineLayer = mapComponent(Layer);
