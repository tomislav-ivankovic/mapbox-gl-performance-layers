import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {dynamicPointRenderer, DynamicPointRendererOptions} from '../renderer-preset/dynamic-point-renderer';
import {PointStyle} from '../../shared/styles';
import {DynamicDataLayer} from '../dynamic-data-layer';
import {PointClickHandler, pointToResultsClickHandler} from '../../shared/click-handler/point-click-handler';
import {DynamicRBrushClickProvider} from '../click-provider/dynamic-r-brush-click-provider';

export interface DynamicPointLayerOptions<G extends Point | MultiPoint, P> extends DynamicPointRendererOptions<P> {
    id: string;
    onClick?: PointClickHandler<G, P>,
    clickSize?: number
}

export function dynamicPointLayer<G extends Point | MultiPoint, P>(
    options: DynamicPointLayerOptions<G, P>
): DynamicDataLayer<G, P, PointStyle> {
    return new DynamicDataLayer({
        id: options.id,
        renderer: dynamicPointRenderer(options),
        clickProvider: options.onClick != null ?
            new DynamicRBrushClickProvider(
                pointToResultsClickHandler(options.onClick),
                options.clickSize
            ) : undefined
    });
}
