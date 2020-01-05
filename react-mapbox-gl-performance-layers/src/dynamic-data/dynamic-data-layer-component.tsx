import {Feature, Geometry} from 'geojson';
import {mapComponent, MapComponentProps} from '../map-component';
import {DataOperations, DynamicDataLayer, StyleOption, Visibility} from 'mapbox-gl-performance-layers';
import {Component} from 'react';
import {compareStyles} from '../compare-styles';

export interface DynamicDataLayerComponentProps<G extends Geometry, P, S extends {}> extends MapComponentProps {
    layerConstructor: () => DynamicDataLayer<G, P, S>;
    data: (dataOperations: DataOperations<Feature<G, P>>) => void;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

class Layer<G extends Geometry, P, S extends {}> extends Component<DynamicDataLayerComponentProps<G, P, S>, {}> {
    private readonly layer: DynamicDataLayer<G, P, S>;

    constructor(props: DynamicDataLayerComponentProps<G, P, S>) {
        super(props);
        this.layer = this.props.layerConstructor();
        this.layer.setStyle(props.style);
        this.layer.setVisibility(props.visibility);
        props.data(this.layer.dataOperations);
    }

    componentDidMount(): void {
        this.addLayer();
    }

    componentWillUnmount(): void {
        this.removeLayer();
    }

    componentDidUpdate(prevProps: Readonly<DynamicDataLayerComponentProps<G, P, S>>): void {
        const props = this.props;
        if (!compareStyles(this.props.style, prevProps.style)) {
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

export const DynamicDataLayerComponent = mapComponent(Layer);
