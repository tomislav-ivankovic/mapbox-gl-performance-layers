import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {lineRenderer, LineRendererOptions} from '../renderer-preset/line-renderer';
import {LineClickProvider, LineClickProviderOptions} from '../click-provider/line-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {LineStyle} from '../../shared/styles';

export interface LineLayerOptions<G extends LineString | MultiLineString, P>
    extends LineRendererOptions<P>, LineClickProviderOptions<G, P> {
    id: string;
}

export function lineLayer<G extends LineString | MultiLineString, P>(
    options: LineLayerOptions<G, P>
): StaticDataLayer<G, P, LineStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: lineRenderer(options),
        clickProvider: new LineClickProvider(options)
    });
}
