import {FeatureCollection} from 'geojson';
import {Geometry} from 'geojson';
import {Component} from 'react';
import {StaticDataLayer} from 'mapbox-gl-performance-layers';
import {StyleOption} from 'mapbox-gl-performance-layers';
import {Visibility} from 'mapbox-gl-performance-layers';
import {MapProp, withMap} from '../with-map';
import {compareStyles} from '../compare-styles';

export interface StaticDataLayerComponentProps<G extends Geometry, P, S extends {}> {
    layerConstructor: () => StaticDataLayer<G, P, S>;
    data: FeatureCollection<G, P> | null | undefined;
    style?: StyleOption<G, P, S>;
    visibility?: Visibility;
    before?: string;
}

class Layer<G extends Geometry, P, S extends {}> extends Component<StaticDataLayerComponentProps<G, P, S> & MapProp, {}> {
    private readonly layer: StaticDataLayer<G, P, S>;

    constructor(props: StaticDataLayerComponentProps<G, P, S> & MapProp) {
        super(props);
        this.layer = this.props.layerConstructor();
        if (props.data != null) {
            this.layer.setDataAndStyle(props.data, props.style);
        } else {
            this.layer.setStyle(props.style);
        }
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
            if (props.data != null) {
                this.layer.setDataAndStyle(props.data, props.style);
            } else {
                this.layer.clearData();
                this.layer.setStyle(props.style);
            }
        } else if (didDataChange) {
            if (props.data != null) {
                this.layer.setData(props.data);
            } else {
                this.layer.clearData();
            }
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

export const StaticDataLayerComponent = withMap(Layer);
