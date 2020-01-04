import React, {Component} from 'react';
import {Feature, FeatureCollection, Geometry, LineString, Point, Polygon} from 'geojson';
import {Map} from '../reusable/map';
import {LineLayer, PointLayer, PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {MapControlDiv} from '../reusable/controls/map-control-div';

interface Properties {
    center: [number, number];
}

interface State {
    center: [number, number];
    zoom: [number];
    points: FeatureCollection<Point, Properties>;
    lines: FeatureCollection<LineString, Properties>;
    polygons: FeatureCollection<Polygon, Properties>;
    selection: Feature<Geometry, Properties> | null;
    arePointsEnabled: boolean;
    areLinesEnabled: boolean;
    arePolygonsEnabled: boolean;
}

export class MultiLayerScreen extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            center: [16, 45],
            zoom: [7],
            points: {
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [15, 45]
                        },
                        properties: {center: [15, 45]}
                    },
                    {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [17, 45]
                        },
                        properties: {center: [17, 45]}
                    }
                ]
            },
            lines: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: [[15, 45], [17, 45]]
                    },
                    properties: {center: [16, 45]}
                }]
            },
            polygons: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [[
                            [14, 45],
                            [15, 44],
                            [17, 44],
                            [18, 45],
                            [17, 46],
                            [15, 46],
                            [14, 45]
                        ]]
                    },
                    properties: {center: [16, 45.5]}
                }]
            },
            selection: null,
            arePointsEnabled: true,
            areLinesEnabled: true,
            arePolygonsEnabled: true
        };
    }

    handleClick = (feature: Feature<Geometry, Properties>) => {
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
                <MapControlDiv position={'top-right'} style={{pointerEvents: 'auto'}}>
                    <button onClick={() => this.setState({arePointsEnabled: !state.arePointsEnabled})}>
                        Points
                    </button>
                    <button onClick={() => this.setState({areLinesEnabled: !state.areLinesEnabled})}>
                        Lines
                    </button>
                    <button onClick={() => this.setState({arePolygonsEnabled: !state.arePolygonsEnabled})}>
                        Polygons
                    </button>
                </MapControlDiv>
                <PolygonLayer
                    data={state.polygons}
                    style={{
                        color: {r: 0, g: 0, b: 1},
                        outlineColor: {r: 0, g: 0, b: 0.5},
                        outlineOpacity: 0.8,
                        outlineSize: 1.8
                    }}
                    onClick={this.handleClick}
                    visibility={state.arePolygonsEnabled}
                    fancy
                />
                <LineLayer
                    data={state.lines}
                    style={{
                        color: {r: 0, g: 1, b: 0},
                        outlineColor: {r: 0, g: 0.5, b: 0},
                        outlineOpacity: 0.8,
                        outlineSize: 1.8
                    }}
                    onClick={this.handleClick}
                    visibility={state.areLinesEnabled}
                    fancy
                />
                <PointLayer
                    data={state.points}
                    style={{
                        color: {r: 1, g: 0, b: 0},
                        outlineColor: {r: 0.5, g: 0, b: 0},
                        outlineOpacity: 0.8,
                        outlineSize: 1.8
                    }}
                    onClick={this.handleClick}
                    visibility={state.arePointsEnabled}
                    fancy
                />
                {state.selection != null &&
                <Popup coordinates={state.selection.properties.center}>
                    <p>{JSON.stringify(state.selection, null, 2)}</p>
                </Popup>
                }
            </Map>
        );
    }
}
