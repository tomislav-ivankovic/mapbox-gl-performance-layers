import {Component} from 'react';
import {Feature, FeatureCollection, Point} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {DataRenderingLayer} from '../mapbox/data-rendering-layer';
import {PointShader, PointStyle} from '../mapbox/shader/point/point-shader';
import {RawRenderer} from '../mapbox/renderer/raw/raw-renderer';
import {TiledRenderer} from '../mapbox/renderer/tiled/tiled-renderer';

export interface PointLayerProps<P> extends MapComponentProps {
    data: FeatureCollection<Point, P>,
    style?: (feature: Feature<Point, P>) => Partial<PointStyle>,
    onClick?: (feature: Feature<Point, P>) => void,
    interpolation?: number
}

class Layer<P> extends Component<PointLayerProps<P>, {}> {
    private readonly layer = new DataRenderingLayer(
        'custom-point',
        [
            {
                renderer: new RawRenderer(
                    new PointShader(
                        this.props.style,
                        this.props.interpolation
                    )
                ),
                condition: data => data.features.length <= 100000
            },
            {
                renderer: new TiledRenderer(
                    new RawRenderer(
                        new PointShader(
                            this.props.style,
                            this.props.interpolation
                        )
                    )
                ),
                condition: data => data.features.length > 100000
            }
        ]
    );

    constructor(props: PointLayerProps<P>) {
        super(props);
        this.layer.setData(this.props.data);
    }

    componentDidMount(): void {
        this.props.map.addLayer(this.layer);
    }

    componentWillUnmount(): void {
        this.props.map.removeLayer(this.layer.id);
    }

    componentDidUpdate(prevProps: Readonly<PointLayerProps<P>>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.data !== prevProps.data) {
            this.layer.setData(this.props.data);
        }
    }

    render() {
        return null;
    }
}

export const PointLayer = mapComponent(Layer);
