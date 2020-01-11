import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {lineRenderer, LineRendererOptions} from '../renderer-preset/line-renderer';
import {StaticDataLayer} from '../static-data-layer';
import {LineStyle} from '../../shared/styles';
import {LineClickHandler, lineToResultsClickHandler} from '../../shared/click-handler/line-click-handler';
import {RBushClickProvider} from '../click-provider/r-bush-click-provider';

export interface LineLayerOptions<G extends LineString | MultiLineString, P> extends LineRendererOptions<P> {
    id: string;
    onClick?: LineClickHandler<G, P>,
    clickSize?: number
}

export function lineLayer<G extends LineString | MultiLineString, P>(
    options: LineLayerOptions<G, P>
): StaticDataLayer<G, P, LineStyle> {
    return new StaticDataLayer({
        id: options.id,
        renderer: lineRenderer(options),
        clickProvider: options.onClick != null ?
            new RBushClickProvider(
                lineToResultsClickHandler(options.onClick),
                options.clickSize
            ) : undefined
    });
}
