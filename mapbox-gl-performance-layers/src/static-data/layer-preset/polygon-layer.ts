import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';
import {polygonRenderer, PolygonRendererOptions} from '../renderer-preset/polygon-renderer';
import {StaticDataLayer} from '../static-data-layer';
import {PolygonStyle} from '../../shared/styles';
import {PolygonClickHandler, polygonToResultsClickHandler} from '../../shared/click-handler/polygon-click-handler';
import {RBushClickProvider} from '../click-provider/r-bush-click-provider';
import {packPolygonFeature} from '../../shared/geometry-functions';

export interface PolygonLayerOptions<G extends Polygon | MultiPolygon, P> extends PolygonRendererOptions<P> {
    id: string;
    onClick?: PolygonClickHandler<G, P>;
}

export function polygonLayer<G extends Polygon | MultiPolygon, P>(
    options: PolygonLayerOptions<G, P>
): StaticDataLayer<G, P, PolygonStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: polygonRenderer(options),
        clickProvider: options.onClick != null ?
            new RBushClickProvider(
                packPolygonFeature,
                polygonToResultsClickHandler(options.onClick),
                0
            ) : undefined
    });
}
