import React, {Component} from 'react';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {Map} from '../reusable/map';
import {LineLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {EventData, MapMouseEvent} from 'mapbox-gl';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<LineString, null>;
    selection: {
        coordinates: [number, number];
        feature: Feature<LineString, null>;
    } | null;
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
                    properties: null
                }))
            },
            selection: null
        };
    }

    handleClick = (
        feature: Feature<LineString, null>,
        e: MapMouseEvent & EventData,
        closestPointOnLine: { x: number; y: number; }
    ) => {
        if (this.state.selection != null && this.state.selection.feature === feature) {
            this.setState({selection: null});
            return;
        }
        this.setState({
            selection: {
                coordinates: [closestPointOnLine.x, closestPointOnLine.y],
                feature: feature
            }
        });
    };

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
                    style={getStyle}
                    onClick={this.handleClick}
                />
                {state.selection != null &&
                <Popup coordinates={state.selection.coordinates}>
                    <p>{JSON.stringify(state.selection.feature, null, 2)}</p>
                </Popup>
                }
            </Map>
        );
    }
}

function getStyle(feature: Feature<LineString, null>) {
    const x = feature.geometry.coordinates[0][0];
    const y = feature.geometry.coordinates[0][1];
    return {
        size: 4 + 1.5 * Math.sin(x - y),
        color: {
            r: x - Math.floor(x),
            g: y - Math.floor(y),
            b: 0.5 + 0.5 * Math.sin(x + y)
        },
        outlineSize: 1.8
    };
}
