import {CustomLayerComponent, CustomLayerComponentProps} from './layer-component';
import {LineString} from 'geojson';
import {lineRenderer, LineRendererOptions} from '../mapbox/renderer-presets/line-renderer';
import {CustomLayer} from '../mapbox/custom-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {LineClickProvider, LineClickProviderOptions} from '../mapbox/click-provider/line-click-provider';

export type LineLayerProps<P> =
    CustomLayerComponentProps<LineString, P> &
    LineRendererOptions<P> &
    LineClickProviderOptions<P>;

class Layer<P> extends CustomLayerComponent<LineLayerProps<P>, {}, LineString, P> {
    protected constructLayer(): CustomLayer<LineString, P> {
        return new CustomLayer(
            this.props.id || `custom-line-${generateID()}`,
            lineRenderer(this.props),
            new LineClickProvider(this.props)
        );
    }
}

export const LineLayer = mapComponent(Layer);
