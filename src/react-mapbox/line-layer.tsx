import {Component} from 'react';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {lineRenderer, LineRendererOptions} from '../mapbox/renderer-presets/line-renderer';
import {generateID} from 'react-mapbox-gl/lib/util/uid';

export interface LineLayerProps<P> extends MapComponentProps, LineRendererOptions<P> {
    id?: string;
    data: FeatureCollection<LineString, P>;
    onClick?: (feature: Feature<LineString, P>) => void;
}

class Layer<P> extends Component<LineLayerProps<P>, {}> {
    private readonly layer = new CustomRenderingLayer<FeatureCollection<LineString, P>>(
        this.props.id || `custom-line-${generateID()}`,
        lineRenderer(this.props)
    );

    constructor(props: LineLayerProps<P>) {
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
