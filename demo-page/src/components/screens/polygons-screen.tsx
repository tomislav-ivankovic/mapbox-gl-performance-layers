import React, {Component} from 'react';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {Map} from '../map';
import {PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {EventData, MapMouseEvent} from 'mapbox-gl';
import {Popup} from 'react-mapbox-gl';

interface State {
    center: [number, number];
    zoom: [number];
    data: FeatureCollection<Polygon, {}>;
    selection: {
        coordinates: [number, number];
        feature: Feature<Polygon, {}>;
    } | null;
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
            const edgePoints: [number, number][] = [];
            const holePoints: [number, number][] = [];
            for (let j = 0; j < numberOfPointsInPolygons; j++) {
                const distance = Math.random() * polygonSpread;
                const angle = (j + Math.random()) * deltaAngle;
                const xShift = distance * Math.cos(angle);
                const yShift = distance * Math.sin(angle);
                edgePoints.push([cX + xShift, cY + yShift]);
                holePoints.push([cX + 0.3 * xShift, cY + 0.3 * yShift]);
            }
            edgePoints.push([edgePoints[0][0], edgePoints[0][1]]);
            holePoints.push([holePoints[0][0], holePoints[0][1]]);
            holePoints.reverse();
            polygons.push([edgePoints, holePoints]);
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
            },
            selection: null
        };
    }

    handleClick = (feature: Feature<Polygon, {}>, e: MapMouseEvent & EventData) => {
        if (this.state.selection != null && this.state.selection.feature === feature) {
            this.setState({selection: null});
            return;
        }
        this.setState({
            selection: {
                coordinates: [e.lngLat.lng, e.lngLat.lat],
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
                <PolygonLayer
                    data={state.data}
                    style={getStyle}
                    onClick={this.handleClick}
                    fancy
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

function getStyle(feature: Feature<Polygon, {}>) {
    const x = feature.geometry.coordinates[0][0][0];
    const y = feature.geometry.coordinates[0][0][1];
    return {
        color: {
            r: x - Math.floor(x),
            g: y - Math.floor(y),
            b: 0.5 + 0.5 * Math.sin(x + y)
        },
        opacity: 0.5,
        outlineOpacity: 0.8,
        outlineSize: 1.8
    };
}
