import {Feature, FeatureCollection, Polygon} from 'geojson';
import React, {Component} from 'react';
import {PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {Map} from '../map';

interface Properties {
    center: [number, number];
    value1: number;
    value2: number;
    value3: number;
}

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Polygon, Properties>;
    selection: Feature<Polygon, Properties> | null;
}

export class GridScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const cellSize = 0.04;
        const gridSize = 250;
        const startX = 16 - 0.5 * (gridSize * cellSize);
        const startY = 45 - 0.5 * (gridSize * cellSize);
        const features: Feature<Polygon, Properties>[] = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x1 = startX + i * cellSize;
                const y1 = startY + j * cellSize;
                const x2 = x1 + cellSize;
                const y2 = y1 + cellSize;
                const polygon = [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [polygon]
                    },
                    properties: {
                        center: [0.5*(x1 + x2), 0.5*(y1 + y2)],
                        value1: 1,
                        value2: 2,
                        value3: 3
                    }
                });
            }
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {type: 'FeatureCollection', features: features},
            selection: null
        };
    }

    handleClick = (feature: Feature<Polygon, Properties>) => {
        const newSelection = feature !== this.state.selection ? feature : null;
        this.setState({selection: newSelection});
    };

    render() {
        const state = this.state;
        return (
            <Map
                style={'mapbox://styles/mapbox/outdoors-v11'}
                center={state.center}
                zoom={state.zoom}
            >
                <PolygonLayer
                    data={state.data}
                    style={() => ({
                        color: {
                            r: Math.random(),
                            g: Math.random(),
                            b: Math.random()
                        }
                    })}
                    onClick={this.handleClick}
                />
                {state.selection != null &&
                <Popup coordinates={state.selection.properties.center}>
                    <div><b>Value 1:</b>&nbsp;{state.selection.properties.value1}</div>
                    <div><b>Value 2:</b>&nbsp;{state.selection.properties.value2}</div>
                    <div><b>Value 3:</b>&nbsp;{state.selection.properties.value3}</div>
                </Popup>
                }
            </Map>
        );
    }
}
