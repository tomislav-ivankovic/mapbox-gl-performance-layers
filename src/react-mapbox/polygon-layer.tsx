import {Component} from 'react';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {polygonRenderer, PolygonRendererOptions} from '../mapbox/renderer-presets/polygon-renderer';

export interface PolygonLayerProps<P> extends MapComponentProps, PolygonRendererOptions<P> {
    data: FeatureCollection<Polygon, P>,
    onClick?: (feature: Feature<Polygon, P>) => void
}

class Layer<P> extends Component<PolygonLayerProps<P>, {}> {
    private readonly layer = new CustomRenderingLayer<FeatureCollection<Polygon, P>>(
        'custom-polygon',
        polygonRenderer(this.props)
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
