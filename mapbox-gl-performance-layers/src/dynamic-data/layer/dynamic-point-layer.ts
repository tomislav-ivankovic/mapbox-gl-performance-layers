import {dynamicPointRenderer, DynamicPointRendererOptions} from '../renderer-preset/dynamic-point-renderer';
import {Point} from 'geojson';
import {PointStyle} from '../../shared/styles';
import {DynamicDataLayer} from './dynamic-data-layer';

export interface DynamicPointLayerOptions<P> extends DynamicPointRendererOptions<P> {
    id: string;
}

export function dynamicPointLayer<P>(options: DynamicPointLayerOptions<P>): DynamicDataLayer<Point, P, PointStyle> {
    return new DynamicDataLayer({
        id: options.id,
        renderer: dynamicPointRenderer(options)
    });
}
