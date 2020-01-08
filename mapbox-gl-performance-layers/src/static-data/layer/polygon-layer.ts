import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {polygonRenderer, PolygonRendererOptions} from '../renderer-preset/polygon-renderer';
import {PolygonClickProvider, PolygonClickProviderOptions} from '../click-provider/polygon-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {PolygonStyle} from '../../shared/styles';

export interface PolygonLayerOptions<G extends Polygon | MultiPolygon, P>
    extends PolygonRendererOptions<P>, PolygonClickProviderOptions<G, P> {
    id: string;
}

export function polygonLayer<G extends Polygon | MultiPolygon, P>(
    options: PolygonLayerOptions<G, P>
): StaticDataLayer<G, P, PolygonStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: polygonRenderer(options),
        clickProvider: new PolygonClickProvider(options)
    });
}
