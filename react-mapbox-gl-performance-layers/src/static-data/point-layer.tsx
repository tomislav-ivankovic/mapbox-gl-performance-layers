import {Point} from 'geojson';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';
import {
    PointClickProvider,
    PointClickProviderOptions,
    pointRenderer,
    PointRendererOptions,
    StaticDataLayer
} from 'mapbox-gl-performance-layers';

export type PointLayerProps<P> =
    StaticDataLayerComponentProps<Point, P> &
    PointRendererOptions<P> &
    PointClickProviderOptions<P>;

class Layer<P> extends StaticDataLayerComponent<PointLayerProps<P>, {}, Point, P> {
    protected constructLayer(): StaticDataLayer<Point, P> {
        return new StaticDataLayer(
            this.props.id || `custom-point-${generateID()}`,
            pointRenderer(this.props),
            new PointClickProvider(this.props)
        );
    }
}

export const PointLayer = mapComponent(Layer);
