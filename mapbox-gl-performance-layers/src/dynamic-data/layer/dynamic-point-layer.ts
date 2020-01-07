import {Point} from 'geojson';
import {dynamicPointRenderer, DynamicPointRendererOptions} from '../renderer-preset/dynamic-point-renderer';
import {PointStyle} from '../../shared/styles';
import {DynamicDataLayer} from './dynamic-data-layer';
import {
    DynamicPointClickProvider,
    DynamicPointClickProviderOptions
} from '../click-provider/dynamic-point-click-provider';

export interface DynamicPointLayerOptions<P> extends DynamicPointRendererOptions<P>, DynamicPointClickProviderOptions<P> {
    id: string;
}

export function dynamicPointLayer<P>(options: DynamicPointLayerOptions<P>): DynamicDataLayer<Point, P, PointStyle> {
    return new DynamicDataLayer({
        id: options.id,
        renderer: dynamicPointRenderer(options),
        clickProvider: new DynamicPointClickProvider(options)
    });
}
