import {Component} from 'react';
import {mapComponent, MapComponentProps} from '../map-component';
import {FeatureCollection, Geometry} from 'geojson';
import {StaticDataLayer, StyleOption} from 'mapbox-gl-performance-layers';

export interface StaticDataLayerComponentProps<G extends Geometry, P, S extends {}> extends MapComponentProps {
    layerConstructor: () => StaticDataLayer<G, P, S>;
    data: FeatureCollection<G, P>;
    style?: StyleOption<G, P, S>;
    before?: string;
}

class Layer<G extends Geometry, P, S extends {}> extends Component<StaticDataLayerComponentProps<G, P, S>, {}> {
    private readonly layer: StaticDataLayer<G, P, S>;

    constructor(props: StaticDataLayerComponentProps<G, P, S>) {
        super(props);
        this.layer = this.props.layerConstructor();
        this.layer.setDataAndStyle(props.data, props.style);
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

function compareStyles<G extends Geometry, P, S extends {}>(a: StyleOption<G, P, S>, b: StyleOption<G, P, S>): boolean {
    if (a === b) {
        return true;
    }
    if (typeof a === 'object' && typeof  b === 'object') {
        return compareObjects(a, b);
    }
    return false;
}

function compareObjects(a: object, b: object) {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length != bKeys.length) {
        return false;
    }
    for (const key of aKeys) {
        // @ts-ignore
        const aChild = a[key];
        // @ts-ignore
        const bChild = b[key];
        if (aChild === bChild) {
            continue;
        }
        if (typeof aChild !== 'object' || typeof bChild !== 'object') {
            return false;
        }
        if (!compareObjects(aChild, bChild)) {
            return false;
        }
    }
    return true;
}

export const StaticDataLayerComponent = mapComponent(Layer);
