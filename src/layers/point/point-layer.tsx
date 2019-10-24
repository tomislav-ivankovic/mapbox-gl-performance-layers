import {Component} from 'react';
import {Feature, FeatureCollection, Point} from 'geojson';
import {layerComponent, LayerComponentProps} from '../layer-component';
import {CustomPointLayer, PointStyle} from './custom-point-layer';

export interface PointLayerProps<P> extends LayerComponentProps {
    data: FeatureCollection<Point, P>,
    style?: (feature: Feature<Point, P>) => Partial<PointStyle>,
    onClick?: (feature: Feature<Point, P>) => void,
    interpolation?: number
}

class Layer<P> extends Component<PointLayerProps<P>, {}> {
    private readonly layer = new CustomPointLayer<P>(
        this.props.data,
        this.props.style,
        this.props.onClick,
        this.props.interpolation
    );

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

export const PointLayer = layerComponent(Layer);
