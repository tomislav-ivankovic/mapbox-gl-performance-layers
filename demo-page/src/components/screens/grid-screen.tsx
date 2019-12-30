import {Feature, FeatureCollection, Polygon} from 'geojson';
import React, {Component} from 'react';
import {PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {Map} from '../reusable/map';
import {Color} from 'mapbox-gl-performance-layers';
import {MapControlDiv} from '../reusable/map-control-div';

interface Properties {
    center: [number, number];
    values: number[];
}

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Polygon, Properties>;
    selection: Feature<Polygon, Properties> | null;
    selectedIndex: number;
}

export class GridScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const cellSize = 0.04;
        const gridSize = 250;
        const centerX = 16;
        const centerY = 45;
        const startX = centerX - 0.5 * (gridSize * cellSize);
        const startY = centerY - 0.5 * (gridSize * cellSize);
        const features: Feature<Polygon, Properties>[] = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x1 = startX + i * cellSize;
                const y1 = startY + j * cellSize;
                const x2 = x1 + cellSize;
                const y2 = y1 + cellSize;
                const x = 0.5 * (x1 + x2);
                const y = 0.5 * (y1 + y2);
                const polygon = [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [polygon]
                    },
                    properties: {
                        center: [x, y],
                        values: [
                            0.5 + 0.5 * Math.sin(
                                Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY))
                            ),
                            0.5 + 0.5 * Math.sin(x + y),
                            x - Math.floor(x)
                        ]
                    }
                });
            }
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {type: 'FeatureCollection', features: features},
            selection: null,
            selectedIndex: 0
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
                    style={polygonStyles[state.selectedIndex]}
                    onClick={this.handleClick}
                />
                <MapControlDiv style={{pointerEvents: 'auto'}}>
                    {[0, 1, 2].map(index =>
                        <button key={index} onClick={() => this.setState({selectedIndex: index})}>
                            Value {index}
                        </button>
                    )}
                </MapControlDiv>
                {state.selection != null &&
                <Popup coordinates={state.selection.properties.center}>
                    {[0, 1, 2].map(index => state.selection != null &&
                        <div
                            key={index}
                            style={{backgroundColor: index === state.selectedIndex ? 'yellow' : 'white'}}
                        >
                            <b>Value {index}:</b>&nbsp;{state.selection.properties.values[index]}
                        </div>
                    )}
                </Popup>
                }
            </Map>
        );
    }
}

const polygonStyles = [0, 1, 2].map(index =>
    (f: Feature<Polygon, Properties>) => ({color: valueToColor(f.properties.values[index])})
);

function valueToColor(value: number): Color {
    return hslToRgb(0.85 * (1 - value), 1, 0.5);
}

function hslToRgb(h: number, s: number, l: number): Color {
    if (s === 0) {
        return {r: 1, g: 1, b: 1};
    }
    const hueToRgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return {
        r: hueToRgb(p, q, h + 1 / 3),
        g: hueToRgb(p, q, h),
        b: hueToRgb(p, q, h - 1 / 3)
    };
}
