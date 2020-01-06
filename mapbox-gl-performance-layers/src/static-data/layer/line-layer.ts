import {lineRenderer, LineRendererOptions} from '../renderer-preset/line-renderer';
import {LineClickProvider, LineClickProviderOptions} from '../click-provider/line-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {LineString} from 'geojson';
import {LineStyle} from '../../shared/styles';

export interface LineLayerOptions<P> extends LineRendererOptions<P>, LineClickProviderOptions<P> {
    id: string;
}

export function lineLayer<P>(options: LineLayerOptions<P>): StaticDataLayer<LineString, P, LineStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: lineRenderer(options),
        clickProvider: new LineClickProvider(options)
    });
}
