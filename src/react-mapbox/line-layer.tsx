import {Component} from 'react';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {ShaderRenderer} from '../mapbox/renderer/shader-renderer';
import {TiledRenderer} from '../mapbox/renderer/tiled/tiled-renderer';
import {LineShader, LineStyle} from '../mapbox/shader/line/line-shader';
import {SwitchRenderer} from '../mapbox/renderer/switch-renderer';

export interface LineLayerProps<P> extends MapComponentProps {
    data: FeatureCollection<LineString, P>,
    style?: (feature: Feature<LineString, P>) => Partial<LineStyle>,
    onClick?: (feature: Feature<LineString, P>) => void,
    interpolation?: number
}

class Layer<P> extends Component<LineLayerProps<P>, {}> {
    private readonly layer = new CustomRenderingLayer<FeatureCollection<LineString, P>>(
        'custom-line',
        new SwitchRenderer([
            {
                renderer: new ShaderRenderer(
                    new LineShader(
                        this.props.style,
                        this.props.interpolation
                    )
                ),
                condition: data => data.features.length <= 100000
            },
            {
                renderer: new TiledRenderer(
                    new ShaderRenderer(
                        new LineShader(
                            this.props.style,
                            this.props.interpolation
                        )
                    )
                ),
                condition: data => data.features.length > 100000
            }
        ])
    );

    constructor(props: LineLayerProps<P>) {
        super(props);
        this.layer.setData(this.props.data);
    }

    componentDidMount(): void {
        this.props.map.addLayer(this.layer);
    }

    componentWillUnmount(): void {
        this.props.map.removeLayer(this.layer.id);
    }

    componentDidUpdate(prevProps: Readonly<LineLayerProps<P>>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.data !== prevProps.data) {
            this.layer.setData(this.props.data);
        }
    }

    render() {
        return null;
    }
}

export const LineLayer = mapComponent(Layer);
