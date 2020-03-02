import React, {useState} from 'react';
import {
    Feature,
    FeatureCollection,
    Geometry,
    MultiLineString,
    MultiPoint,
    MultiPolygon
} from 'geojson';
import {Map} from '../reusable/map';
import {LineLayer, PointLayer, PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {DivControl} from '../reusable/controls/div-control';

interface Properties {
    center: [number, number];
}

const points: FeatureCollection<MultiPoint, Properties> = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'MultiPoint',
                coordinates: [
                    [15, 45],
                    [15, 45 + 0.25],
                    [15, 45 - 0.25]
                ]
            },
            properties: {center: [15, 45]}
        },
        {
            type: 'Feature',
            geometry: {
                type: 'MultiPoint',
                coordinates: [
                    [17, 45],
                    [17, 45 + 0.25],
                    [17, 45 - 0.25]
                ],
            },
            properties: {center: [17, 45]}
        }
    ]
};

const lines: FeatureCollection<MultiLineString, Properties> = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'MultiLineString',
            coordinates: [
                [[15, 45], [17, 45]],
                [[15, 45 + 0.25], [17, 45 + 0.25]],
                [[15, 45 - 0.25], [17, 45 - 0.25]],
            ]
        },
        properties: {center: [16, 45]}
    }]
};

const polygons: FeatureCollection<MultiPolygon, Properties> = {
    type: 'FeatureCollection',
    features: [{
        type: 'Feature',
        geometry: {
            type: 'MultiPolygon',
            coordinates: [
                [[
                    [14, 45],
                    [15, 44],
                    [17, 44],
                    [18, 45],
                    [17, 46],
                    [15, 46],
                    [14, 45]
                ]],
                [[
                    [15, 46.1],
                    [17, 46.1],
                    [17, 46.2],
                    [15, 46.2],
                    [15, 46.1]
                ]],
            ]
        },
        properties: {center: [16, 45.5]}
    }]
};

export function MultiLayerScreen() {
    const [selection, setSelection] = useState<Feature<Geometry, Properties> | null>(null);
    const [arePointsEnabled, setPointsEnabled] = useState(true);
    const [areLinesEnabled, setLinesEnabled] = useState(true);
    const [arePolygonsEnabled, setPolygonsEnabled] = useState(true);

    const handleClick = (feature: Feature<Geometry, Properties>) => {
        const newSelected = feature !== selection ? feature : null;
        setSelection(newSelected);
    };

    const [style, setStyle] = useState('mapbox://styles/mapbox/outdoors-v11');

    return (
        <Map style={style}>
            <DivControl position={'top-right'} style={{pointerEvents: 'auto'}}>
                <button onClick={() => setPointsEnabled(!arePointsEnabled)}>
                    Points
                </button>
                <button onClick={() => setLinesEnabled(!areLinesEnabled)}>
                    Lines
                </button>
                <button onClick={() => setPolygonsEnabled(!arePolygonsEnabled)}>
                    Polygons
                </button>
                <button onClick={() => setStyle('mapbox://styles/mapbox/outdoors-v11')}>
                    Outdoors
                </button>
                <button onClick={() => setStyle('mapbox://styles/mapbox/streets-v11')}>
                    Streets
                </button>
            </DivControl>
            <PolygonLayer
                data={polygons}
                style={{
                    color: {r: 0, g: 0, b: 1},
                    outlineColor: {r: 0, g: 0, b: 0.5},
                    outlineOpacity: 0.8,
                    outlineSize: 1.8
                }}
                onClick={handleClick}
                visibility={arePolygonsEnabled}
            />
            <LineLayer
                data={lines}
                style={{
                    color: {r: 0, g: 1, b: 0},
                    outlineColor: {r: 0, g: 0.5, b: 0},
                    outlineOpacity: 0.8,
                    outlineSize: 1.8
                }}
                onClick={handleClick}
                visibility={areLinesEnabled}
            />
            <PointLayer
                data={points}
                style={{
                    color: {r: 1, g: 0, b: 0},
                    outlineColor: {r: 0.5, g: 0, b: 0},
                    outlineOpacity: 0.8,
                    outlineSize: 1.8
                }}
                onClick={handleClick}
                visibility={arePointsEnabled}
            />
            {selection != null &&
            <Popup coordinates={selection.properties.center}>
                <p>{JSON.stringify(selection, null, 1)}</p>
            </Popup>
            }
        </Map>
    );
}
