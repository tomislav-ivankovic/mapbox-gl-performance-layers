import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {pointRenderer, PointRendererOptions} from '../renderer-preset/point-renderer';
import {StaticDataLayer} from '../static-data-layer';
import {PointStyle} from '../../shared/styles';
import {PointClickHandler} from '../../shared/click-handler/point-click-handler';
import {KdBushClickProvider} from '../click-provider/kd-bush-click-provider';

export interface PointLayerOptions<G extends Point | MultiPoint, P> extends PointRendererOptions<P> {
    id: string;
    onClick?: PointClickHandler<G, P>,
    clickSize?: number
}

export function pointLayer<G extends Point | MultiPoint, P>(
    options: PointLayerOptions<G, P>
): StaticDataLayer<G, P, PointStyle>  {
    return new StaticDataLayer({
        id: options.id,
        renderer: pointRenderer(options),
        clickProvider: options.onClick != null ?
            new KdBushClickProvider(
                options.onClick,
                options.clickSize
            ) : undefined
    });
}
