import {Component} from 'react';
import {StaticDataLayer} from '../../mapbox-gl-fast-layers/static-data/static-data-layer';
import {MapComponentProps} from './map-component';
import {FeatureCollection, Geometry} from 'geojson';

export interface StaticDataLayerComponentProps<G extends Geometry, P> extends MapComponentProps {
    id?: string;
    data: FeatureCollection<G, P>;
}

export abstract class StaticDataLayerComponent<P extends StaticDataLayerComponentProps<G, P1>, S, G extends Geometry, P1>
    extends Component<P, S> {

    protected readonly layer = this.constructLayer();

    constructor(props: P) {
        super(props);
        this.layer.setData(props.data);
    }

    protected abstract constructLayer(): StaticDataLayer<G, P1>;

    componentDidMount(): void {
        this.props.map.addLayer(this.layer);
    }

    componentWillUnmount(): void {
        if (this.props.map.getStyle() == null) {
            return;
        }
        this.props.map.removeLayer(this.layer.id);
    }

    componentDidUpdate(prevProps: Readonly<P>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.data !== prevProps.data) {
            this.layer.setData(this.props.data);
        }
    }

    render() {
        return null;
    }
}
