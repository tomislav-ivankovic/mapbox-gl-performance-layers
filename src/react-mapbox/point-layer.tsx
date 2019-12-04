import {CustomLayerComponent, CustomLayerComponentProps} from './layer-component';
import {pointRenderer, PointRendererOptions} from '../mapbox/renderer-presets/point-renderer';
import {Point} from 'geojson';
import {CustomLayer} from '../mapbox/custom-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';
import {PointClickProvider, PointClickProviderOptions} from '../mapbox/click-provider/point-click-provider';

export type PointLayerProps<P> =
    CustomLayerComponentProps<Point, P> &
    PointRendererOptions<P> &
    PointClickProviderOptions<P>;

class Layer<P> extends CustomLayerComponent<PointLayerProps<P>, {}, Point, P> {
    protected constructLayer(): CustomLayer<Point, P> {
        return new CustomLayer(
            this.props.id || `custom-point-${generateID()}`,
            pointRenderer(this.props),
            new PointClickProvider(this.props)
        );
    }
}

export const PointLayer = mapComponent(Layer);
