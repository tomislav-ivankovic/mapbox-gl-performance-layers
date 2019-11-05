import {Component} from 'react';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {ShaderRenderer} from '../mapbox/renderer/shader-renderer';
import {TiledRenderer} from '../mapbox/renderer/tiled/tiled-renderer';
import {PolygonShader, PolygonStyle} from '../mapbox/shader/polygon/polygon-shader';
import {SwitchRenderer} from '../mapbox/renderer/switch-renderer';

export interface PolygonLayerProps<P> extends MapComponentProps {
    data: FeatureCollection<Polygon, P>,
    style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>,
    onClick?: (feature: Feature<Polygon, P>) => void,
    interpolation?: number
}

class Layer<P> extends Component<PolygonLayerProps<P>, {}> {
    private readonly layer = new CustomRenderingLayer<FeatureCollection<Polygon, P>>(
        'custom-polygon',
        new SwitchRenderer([
            {
                renderer: new ShaderRenderer(
                    new PolygonShader(
                        this.props.style,
                        this.props.interpolation
                    )
                ),
                condition: data => data.features.length <= 100000
            },
            {
                renderer: new TiledRenderer(
                    new ShaderRenderer(
                        new PolygonShader(
                            this.props.style,
                            this.props.interpolation
                        )
                    )
                ),
                condition: data => data.features.length > 100000
            }
        ])
    );

    constructor(props: PolygonLayerProps<P>) {
        super(props);
        this.layer.setData(this.props.data);
    }

    componentDidMount(): void {
        this.props.map.addLayer(this.layer);
    }

    componentWillUnmount(): void {
        this.props.map.removeLayer(this.layer.id);
    }

    componentDidUpdate(prevProps: Readonly<PolygonLayerProps<P>>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.data !== prevProps.data) {
            this.layer.setData(this.props.data);
        }
    }

    render() {
        return null;
    }
}

export const PolygonLayer = mapComponent(Layer);
