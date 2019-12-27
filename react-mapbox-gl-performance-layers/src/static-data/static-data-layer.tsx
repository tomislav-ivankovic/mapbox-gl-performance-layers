import {Component} from 'react';
import {mapComponent, MapComponentProps} from '../map-component';
import {FeatureCollection, Geometry} from 'geojson';
import {StaticDataLayer} from 'mapbox-gl-performance-layers';

export interface StaticDataLayerComponentProps<G extends Geometry, P> extends MapComponentProps {
    layerConstructor: () => StaticDataLayer<G, P>;
    data: FeatureCollection<G, P>;
}

class Layer<G extends Geometry, P> extends Component<StaticDataLayerComponentProps<G, P>, {}> {
    private readonly layer: StaticDataLayer<G, P>;

    constructor(props: StaticDataLayerComponentProps<G, P>) {
        super(props);
        this.layer = this.props.layerConstructor();
        this.layer.setData(props.data);
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

    componentDidUpdate(prevProps: Readonly<StaticDataLayerComponentProps<G, P>>): void {
        if (this.props.data !== prevProps.data) {
            this.layer.setData(this.props.data);
        }
    }

    render() {
        return null;
    }
}

export const StaticDataLayerComponent = mapComponent(Layer);
