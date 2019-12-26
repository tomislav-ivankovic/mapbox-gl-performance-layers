import {lineRenderer, LineRendererOptions} from '../renderer-presets/line-renderer';
import {LineClickProvider, LineClickProviderOptions} from '../click-provider/line-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {LineString} from 'geojson';

export interface LineLayerOptions<P> extends LineRendererOptions<P>, LineClickProviderOptions<P> {
    id: string;
}

export function lineLayer<P>(options: LineLayerOptions<P>): StaticDataLayer<LineString, P> {
    return new StaticDataLayer({
        id: options.id,
        renderer: lineRenderer(options),
        clickProvider: new LineClickProvider(options)
    });
}