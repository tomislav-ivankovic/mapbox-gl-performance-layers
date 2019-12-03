import {CustomLayerComponent, CustomLayerComponentProps} from './layer-component';
import {pointRenderer, PointRendererOptions} from '../mapbox/renderer-presets/point-renderer';
import {FeatureCollection, Point} from 'geojson';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';

export type PointLayerProps<P> = CustomLayerComponentProps<FeatureCollection<Point, P>> & PointRendererOptions<P>;

class Layer<P> extends CustomLayerComponent<PointLayerProps<P>, {}, FeatureCollection<Point, P>> {
    protected constructLayer(): CustomRenderingLayer<FeatureCollection<Point, P>> {
        return new CustomRenderingLayer<FeatureCollection<Point, P>>(
            this.props.id || `custom-point-${generateID()}`,
            pointRenderer(this.props)
        );
    }
}

export const PointLayer = mapComponent(Layer);
