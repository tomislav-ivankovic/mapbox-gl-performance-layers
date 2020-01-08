import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {pointRenderer, PointRendererOptions} from '../renderer-preset/point-renderer';
import {PointClickProvider, PointClickProviderOptions} from '../click-provider/point-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {PointStyle} from '../../shared/styles';

export interface PointLayerOptions<G extends Point | MultiPoint, P>
    extends PointRendererOptions<P>, PointClickProviderOptions<G, P> {
    id: string;
}

export function pointLayer<G extends Point | MultiPoint, P>(
    options: PointLayerOptions<G, P>
): StaticDataLayer<G, P, PointStyle>  {
    return new StaticDataLayer({
        id: options.id,
        renderer: pointRenderer(options),
        clickProvider: new PointClickProvider(options)
    });
}
