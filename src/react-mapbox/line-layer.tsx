import {CustomLayerComponent, CustomLayerComponentProps} from './layer-component';
import {FeatureCollection, LineString} from 'geojson';
import {lineRenderer, LineRendererOptions} from '../mapbox/renderer-presets/line-renderer';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';
import {mapComponent} from './map-component';

export type LineLayerProps<P> = CustomLayerComponentProps<FeatureCollection<LineString, P>> & LineRendererOptions<P>;

class Layer<P> extends CustomLayerComponent<LineLayerProps<P>, {}, FeatureCollection<LineString, P>> {
    protected constructLayer(): CustomRenderingLayer<FeatureCollection<LineString, P>> {
        return new CustomRenderingLayer<FeatureCollection<LineString, P>>(
            this.props.id || `custom-line-${generateID()}`,
            lineRenderer(this.props)
        );
    }
}

export const LineLayer = mapComponent(Layer);
