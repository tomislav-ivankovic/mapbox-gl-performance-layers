import {Component} from 'react';
import {mapComponent, MapComponentProps} from '../map-component';
import {FeatureCollection, Geometry} from 'geojson';
import {StaticDataLayer, StyleOption, Visibility} from 'mapbox-gl-performance-layers';
import {compareStyles} from '../compare-styles';

export interface StaticDataLayerComponentProps<G extends Geometry, P, S extends {}> extends MapComponentProps {
    layerConstructor: () => StaticDataLayer<G, P, S>;
    data: FeatureCollection<G, P>;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

class Layer<G extends Geometry, P, S extends {}> extends Component<StaticDataLayerComponentProps<G, P, S>, {}> {
    private readonly layer: StaticDataLayer<G, P, S>;

    constructor(props: StaticDataLayerComponentProps<G, P, S>) {
        super(props);
        this.layer = this.props.layerConstructor();
        this.layer.setDataAndStyle(props.data, props.style);
        this.layer.setVisibility(props.visibility);
    }

    componentDidMount(): void {
        this.addLayer();
    }

    componentWillUnmount(): void {
        this.removeLayer();
    }

    componentDidUpdate(prevProps: Readonly<StaticDataLayerComponentProps<G, P, S>>): void {
        const props = this.props;
        const didDataChange = this.props.data !== prevProps.data;
        const didStyleChange = !compareStyles(this.props.style, prevProps.style);
        if (didDataChange && didStyleChange) {
            this.layer.setDataAndStyle(props.data, props.style);
        } else if (didDataChange) {
            this.layer.setData(props.data);
        } else if (didStyleChange) {
            this.layer.setStyle(props.style);
        }
        if (props.visibility !== prevProps.visibility) {
            this.layer.setVisibility(props.visibility);
        }
        if (props.before !== prevProps.before) {
            this.removeLayer();
            this.addLayer();
        }
    }

    private addLayer() {
        this.props.map.addLayer(this.layer, this.props.before);
    }

    private removeLayer() {
        if (this.props.map.getStyle() != null) {
            this.props.map.removeLayer(this.layer.id);
        }
    }

    render() {
        return null;
    }
}

export const StaticDataLayerComponent = mapComponent(Layer);
