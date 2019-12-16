import {pointRenderer, PointRendererOptions} from '../../mapbox-gl-fast-layers/static-data/renderer-presets/point-renderer';
import {Point} from 'geojson';
import {StaticDataLayer} from '../../mapbox-gl-fast-layers/static-data/static-data-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {PointClickProvider, PointClickProviderOptions} from '../../mapbox-gl-fast-layers/static-data/click-provider/point-click-provider';
import {StaticDataLayerComponent, StaticDataLayerComponentProps} from './static-data-layer';

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
