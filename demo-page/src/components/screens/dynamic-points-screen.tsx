import React, {Component} from 'react';
import {Map} from '../reusable/map';
import {Feature, Point} from 'geojson';
import {Popup} from 'react-mapbox-gl';
import {DynamicPointLayer} from 'react-mapbox-gl-performance-layers';
import {Color, DataOperations} from 'mapbox-gl-performance-layers';

interface Properties {
    color: Color;
}

interface State {
    center: [number, number];
    zoom: [number];
    selection: Feature<Point, Properties> | null;
}

export class DynamicPointsScreen extends Component<{}, State> {
    private intervalId: any = null;
    private dataOperations: DataOperations<Feature<Point, Properties>> | null = null;

    constructor(props: {}) {
        super(props);
        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            selection: null
        };
    }

    componentDidMount(): void {
        this.intervalId = setInterval(this.onInterval, 250);
    }

    componentWillUnmount(): void {
        clearInterval(this.intervalId);
    }

    onInterval = () => {
        const data = this.dataOperations;
        if (data == null) {
            return;
        }

        const maxNumberOfPoints = 100000;
        const numberOfPointsPerInterval = 1000;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;

        if (data.getSize() + numberOfPointsPerInterval > maxNumberOfPoints) {
            data.removeNFirst(numberOfPointsPerInterval);
        }

        const features: Feature<Point, Properties>[] = [];
        for (let i = 0; i < numberOfPointsPerInterval; i++) {
            const x = centerX + (Math.random() - 0.5) * spread;
            const y = centerY + (Math.random() - 0.5) * spread;
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [x, y]
                },
                properties: {
                    color: {
                        r: Math.random(),
                        g: Math.random(),
                        b: Math.random()
                    }
                }
            });
        }
        data.addAll(features);
    };

    handleClick = (feature: Feature<Point, Properties>) => {
        const newSelected = feature !== this.state.selection ? feature : null;
        this.setState({selection: newSelected});
    };

    render() {
        const state = this.state;
        return (
            <Map
                style={'mapbox://styles/mapbox/outdoors-v11'}
                center={state.center}
                zoom={state.zoom}
            >
                <DynamicPointLayer
                    data={dataOperations => this.dataOperations = dataOperations}
                    style={getStyle}
                    simpleRendering
                />
                {state.selection != null &&
                <Popup coordinates={state.selection.geometry.coordinates}>
                    <p>{JSON.stringify(state.selection, null, 2)}</p>
                </Popup>
                }
            </Map>
        );
    }
}

function getStyle(feature: Feature<Point, Properties>) {
    return {
        size: 8,
        color: feature.properties.color,
    };
}
