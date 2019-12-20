import React, {Component} from 'react';
import {FeatureCollection, Polygon} from 'geojson';
import {Map} from '../map';
import {PolygonLayer} from '../../react-mapbox-gl-fast-layers/static-data/polygon-layer';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Polygon, {}>;
}

export class PolygonsScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);

        const numberOfPolygons = 10000;
        const numberOfPointsInPolygons = 7;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const polygonSpread = 0.1;
        const deltaAngle = 2 * Math.PI / numberOfPointsInPolygons;
        const polygons: [number, number][][][] = [];
        for (let i = 0; i < numberOfPolygons; i++) {
            const cX = centerX + (Math.random() - 0.5) * spread;
            const cY = centerY + (Math.random() - 0.5) * spread;
            const points: [number, number][] = [];
            for (let j = 0; j < numberOfPointsInPolygons; j++) {
                const distance = Math.random() * polygonSpread;
                const angle = j * deltaAngle + Math.random() * deltaAngle;
                const x = cX + distance * Math.cos(angle);
                const y = cY + distance * Math.sin(angle);
                points.push([x, y]);
            }
            points.push([points[0][0], points[0][1]]);
            polygons.push([points]);
        }

        this.state = {
            center: [16, 44.5],
            zoom: [6.5],
            data: {
                type: 'FeatureCollection',
                features: polygons.map(p => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: p
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
                <PolygonLayer
                    data={state.data}
                    onClick={f => console.dir(f)}
                    fancy
                />
            </Map>
        );
    }
}
