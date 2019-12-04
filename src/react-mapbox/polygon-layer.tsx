import {Polygon} from 'geojson';
import {mapComponent} from './map-component';
import {CustomLayer} from '../mapbox/custom-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {CustomLayerComponent, CustomLayerComponentProps} from './layer-component';
import {polygonRenderer, PolygonRendererOptions} from '../mapbox/renderer-presets/polygon-renderer';
import {PolygonClickProvider, PolygonClickProviderOptions} from '../mapbox/click-provider/polygon-click-provider';

export type PolygonLayerProps<P> =
    CustomLayerComponentProps<Polygon, P> &
    PolygonRendererOptions<P> &
    PolygonClickProviderOptions<P>;

class Layer<P> extends CustomLayerComponent<PolygonLayerProps<P>, {}, Polygon, P> {
    protected constructLayer(): CustomLayer<Polygon, P> {
        return new CustomLayer(
            this.props.id || `custom-point-${generateID()}`,
            polygonRenderer(this.props),
            new PolygonClickProvider(this.props)
        );
    }
}

export const PolygonLayer = mapComponent(Layer);
