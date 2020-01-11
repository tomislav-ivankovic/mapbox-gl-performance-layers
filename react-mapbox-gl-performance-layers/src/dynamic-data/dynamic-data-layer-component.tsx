import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {Component} from 'react';
import {DataOperations} from 'mapbox-gl-performance-layers';
import {DynamicDataLayer} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {MapProp, withMap} from '../with-map';
import {compareStyles} from '../compare-styles';

export interface DynamicDataLayerComponentProps<G extends Geometry, P, S extends {}> {
    layerConstructor: () => DynamicDataLayer<G, P, S>;
    data: (dataOperations: DataOperations<Feature<G, P>>) => void;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

class Layer<G extends Geometry, P, S extends {}> extends Component<DynamicDataLayerComponentProps<G, P, S> & MapProp, {}> {
    private readonly layer: DynamicDataLayer<G, P, S>;

    constructor(props: DynamicDataLayerComponentProps<G, P, S> & MapProp) {
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

export const DynamicDataLayerComponent = withMap(Layer);
