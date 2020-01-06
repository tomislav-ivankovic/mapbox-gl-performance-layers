import {polygonRenderer, PolygonRendererOptions} from '../renderer-preset/polygon-renderer';
import {PolygonClickProvider, PolygonClickProviderOptions} from '../click-provider/polygon-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {Polygon} from 'geojson';
import {PolygonStyle} from '../../shared/styles';

export interface PolygonLayerOptions<P> extends PolygonRendererOptions<P>, PolygonClickProviderOptions<P> {
    id: string;
}

export function polygonLayer<P>(options: PolygonLayerOptions<P>): StaticDataLayer<Polygon, P, PolygonStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: polygonRenderer(options),
        clickProvider: new PolygonClickProvider(options)
    });
}
