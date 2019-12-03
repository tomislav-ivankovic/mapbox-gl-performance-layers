import {Component} from 'react';
import {CustomRenderingLayer} from '../mapbox/custom-rendering-layer';
import {MapComponentProps} from './map-component';

export interface CustomLayerComponentProps<D> extends MapComponentProps {
    id?: string;
    data: D;
}

export abstract class CustomLayerComponent<P extends CustomLayerComponentProps<D>, S, D> extends Component<P, S> {
    protected readonly layer = this.constructLayer();

    constructor(props: P) {
        super(props);
        this.layer.setData(props.data);
    }

    protected abstract constructLayer(): CustomRenderingLayer<D>;

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
