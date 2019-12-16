import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {LineString} from 'geojson';
import {lineRenderer, LineRendererOptions} from '../../mapbox-gl-fast-layers/static-data/renderer-presets/line-renderer';
import {StaticDataLayer} from '../../mapbox-gl-fast-layers/static-data/static-data-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {LineClickProvider, LineClickProviderOptions} from '../../mapbox-gl-fast-layers/static-data/click-provider/line-click-provider';

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
