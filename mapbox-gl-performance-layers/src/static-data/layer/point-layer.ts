import {pointRenderer, PointRendererOptions} from '../renderer-preset/point-renderer';
import {PointClickProvider, PointClickProviderOptions} from '../click-provider/point-click-provider';
import {StaticDataLayer} from './static-data-layer';
import {Point} from 'geojson';
import {PointStyle} from '../../styles';

export interface PointLayerOptions<P> extends PointRendererOptions<P>, PointClickProviderOptions<P> {
    id: string;
}

export function pointLayer<P>(options: PointLayerOptions<P>): StaticDataLayer<Point, P, PointStyle>  {
    return new StaticDataLayer({
        id: options.id,
        renderer: pointRenderer(options),
        clickProvider: new PointClickProvider(options)
    });
}
