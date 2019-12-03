import {Component} from 'react';
import {Feature, FeatureCollection, Point} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {pointRenderer, PointRendererOptions} from '../mapbox/renderer-presets/point-renderer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';

export interface PointLayerProps<P> extends MapComponentProps, PointRendererOptions<P> {
    id?: string;
    data: FeatureCollection<Point, P>;
    onClick?: (feature: Feature<Point, P>) => void;
}

class Layer<P> extends Component<PointLayerProps<P>, {}> {
    private readonly layer = new CustomRenderingLayer<FeatureCollection<Point, P>>(
        this.props.id || `custom-point-${generateID()}`,
        pointRenderer(this.props)
    );

    constructor(props: PointLayerProps<P>) {
        super(props);
        this.layer.setData(this.props.data);
    }

    componentDidMount(): void {
        this.props.map.addLayer(this.layer);
    }

    componentWillUnmount(): void {
        if (this.props.map.getStyle() == null) {
            return;
        }
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
