import {polygonRenderer, PolygonRendererOptions} from '../renderer-presets/polygon-renderer';
import {PolygonClickProvider, PolygonClickProviderOptions} from '../click-provider/polygon-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {Polygon} from 'geojson';

export interface PolygonLayerOptions<P> extends PolygonRendererOptions<P>, PolygonClickProviderOptions<P> {
    id: string;
}

export function polygonLayer<P>(options: PolygonLayerOptions<P>): StaticDataLayer<Polygon, P> {
    return new StaticDataLayer({
        id: options.id,
        renderer: polygonRenderer(options),
        clickProvider: new PolygonClickProvider(options)
    });
}
