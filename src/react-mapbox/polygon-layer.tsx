import {Component} from 'react';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {mapComponent, MapComponentProps} from './map-component';
import {DataRenderingLayer} from '../mapbox/data-rendering-layer';
import {RawRenderer} from '../mapbox/renderer/raw/raw-renderer';
import {TiledRenderer} from '../mapbox/renderer/tiled/tiled-renderer';
import {PolygonShader, PolygonStyle} from '../mapbox/shader/polygon/polygon-shader';

export interface PolygonLayerProps<P> extends MapComponentProps {
    data: FeatureCollection<Polygon, P>,
    style?: (feature: Feature<Polygon, P>) => Partial<PolygonStyle>,
    onClick?: (feature: Feature<Polygon, P>) => void,
    interpolation?: number
}

class Layer<P> extends Component<PolygonLayerProps<P>, {}> {
    private readonly layer = new DataRenderingLayer(
        'custom-polygon',
        [
            {
                renderer: new RawRenderer(
                    new PolygonShader(
                        this.props.style,
                        this.props.interpolation
                    )
                ),
                condition: data => data.features.length <= 100000
            },
            {
                renderer: new TiledRenderer(
                    new RawRenderer(
                        new PolygonShader(
                            this.props.style,
                            this.props.interpolation
                        )
                    )
                ),
                condition: data => data.features.length > 100000
            }
        ]
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
