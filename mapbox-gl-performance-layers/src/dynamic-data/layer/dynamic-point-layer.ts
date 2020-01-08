import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {dynamicPointRenderer, DynamicPointRendererOptions} from '../renderer-preset/dynamic-point-renderer';
import {PointStyle} from '../../shared/styles';
import {DynamicDataLayer} from './dynamic-data-layer';
import {
    DynamicPointClickProvider,
    DynamicPointClickProviderOptions
} from '../click-provider/dynamic-point-click-provider';

export interface DynamicPointLayerOptions<G extends Point | MultiPoint, P>
    extends DynamicPointRendererOptions<P>, DynamicPointClickProviderOptions<G, P> {
    id: string;
}

export function dynamicPointLayer<G extends Point | MultiPoint, P>(
    options: DynamicPointLayerOptions<G, P>
): DynamicDataLayer<G, P, PointStyle> {
    return new DynamicDataLayer({
        id: options.id,
        renderer: dynamicPointRenderer(options),
        clickProvider: new DynamicPointClickProvider(options)
    });
}
