import React, {Component} from 'react';
import {FeatureCollection, LineString} from 'geojson';
import {Map} from '../map';
import {LineLayer} from '../../react-mapbox-gl-fast-layers/static-data/line-layer';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<LineString, {}>;
}

export class LinesScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const numberOfLines = 20000;
        const numberOfPointsInLine = 20;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const lineSpread = 0.1;
        const lines: [number, number][][] = [];
        for (let i = 0; i < numberOfLines; i++) {
            let x = centerX + (Math.random() - 0.5) * spread;
            let y = centerY + (Math.random() - 0.5) * spread;
            const points: [number, number][] = [];
            for (let j = 0; j < numberOfPointsInLine; j++) {
                points.push([x, y]);
                x += (Math.random() - 0.5) * lineSpread;
                y += (Math.random() - 0.5) * lineSpread;
            }
            lines.push(points);
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {
                type: 'FeatureCollection',
                features: lines.map(l => ({
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: l
                    },
                    properties: {}
                }))
            }
        };
    }

    render() {
        const state = this.state;
        return (
            <Map
                style={'mapbox://styles/mapbox/outdoors-v11'}
                center={state.center}
                zoom={state.zoom}
            >
                <LineLayer
                    data={state.data}
                    onClick={f => console.dir(f)}
                    fancy
                />
            </Map>
        );
    }
}
