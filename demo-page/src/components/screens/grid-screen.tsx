import {Feature, FeatureCollection, Point, Polygon} from 'geojson';
import React, {useState} from 'react';
import {PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Layer, Popup, Source} from 'react-mapbox-gl';
import {Map} from '../reusable/map';
import {Color} from 'mapbox-gl-performance-layers';
import {DivControl} from '../reusable/controls/div-control';

interface PolygonProperties {
    center: [number, number];
    values: number[];
}

interface PointProperties {
    [valueId: string]: string;
}

export function GridScreen() {
    const [{points, polygons}] = useState(() => {
        const cellSize = 0.04;
        const gridSize = 250;
        const centerX = 16;
        const centerY = 45;
        const startX = centerX - 0.5 * (gridSize * cellSize);
        const startY = centerY - 0.5 * (gridSize * cellSize);
        const polygons: Feature<Polygon, PolygonProperties>[] = [];
        const points: Feature<Point, PointProperties>[] = [];
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x1 = startX + i * cellSize;
                const y1 = startY + j * cellSize;
                const x2 = x1 + cellSize;
                const y2 = y1 + cellSize;
                const x = 0.5 * (x1 + x2);
                const y = 0.5 * (y1 + y2);
                const polygon = [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
                const polygonProperties: PolygonProperties = {
                    center: [x, y],
                    values: [
                        0.5 + 0.5 * Math.sin(
                            Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY))
                        ),
                        0.5 + 0.5 * Math.sin(x + y),
                        x - Math.floor(x)
                    ]
                };
                const pointProperties: PointProperties = {};
                for (let i = 0; i < polygonProperties.values.length; i++) {
                    const value = polygonProperties.values[i];
                    pointProperties[i.toString()] = valueToString(value);
                }
                polygons.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Polygon',
                        coordinates: [polygon]
                    },
                    properties: polygonProperties
                });
                points.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [x, y]
                    },
                    properties: pointProperties
                });
            }
        }
        const polygonCollection: FeatureCollection<Polygon, PolygonProperties> = {
            type: 'FeatureCollection',
            features: polygons
        };
        const pointCollection: FeatureCollection<Point, PointProperties> = {
            type: 'FeatureCollection',
            features: points
        };
        return {
            polygons: polygonCollection,
            points: pointCollection
        };
    });
    const [selection, setSelection] = useState<Feature<Polygon, PolygonProperties> | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleClick = (feature: Feature<Polygon, PolygonProperties>) => {
        const newSelection = feature !== selection ? feature : null;
        setSelection(newSelection);
    };

    return (
        <Map>
            <DivControl
                position={'top-right'}
                style={{pointerEvents: 'auto'}}
            >
                {[0, 1, 2].map(index =>
                    <button key={index} onClick={() => setSelectedIndex(index)}>
                        Value {index}
                    </button>
                )}
            </DivControl>
            <DivControl
                position={'bottom-right'}
                style={{textAlign: 'right'}}
            >
                <div style={{
                    display: 'inline-block',
                    position: 'relative',
                    backgroundColor: 'white',
                    border: '1px solid black',
                    margin: '10px',
                    padding: '5px'
                }}>
                    {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(value =>
                        <div key={value.toString()} style={{textAlign: 'right'}}>
                            {valueToString(value)}
                            &nbsp;
                            <div style={{
                                display: 'inline-block',
                                margin: 0,
                                width: 12,
                                height: 12,
                                border: '1px solid black',
                                backgroundColor: rgbColorToCss(valueToColor(value)),
                            }}/>
                        </div>
                    )}
                </div>
            </DivControl>
            <PolygonLayer
                id={'grid-color'}
                data={polygons}
                style={polygonStyles[selectedIndex]}
                onClick={handleClick}
                before={'grid-text'}
                simpleRendering
            />
            <Layer/>
            <Source
                id={'points-source'}
                geoJsonSource={{type: 'geojson', data: points}}
            />
            <Layer
                id={'grid-text'}
                sourceId={'points-source'}
                data={points}
                minZoom={10}
                layout={{
                    'text-field': `{${selectedIndex}}`,
                    'text-anchor': 'center',
                    'icon-allow-overlap': true
                }}
                paint={{
                    'text-opacity': 1,
                    'text-color': '#000000',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 1
                }}
            />
            {selection != null &&
            <Popup coordinates={selection.properties.center}>
                {[0, 1, 2].map(index => selection != null &&
                    <div
                        key={index}
                        style={{backgroundColor: index === selectedIndex ? 'yellow' : 'white'}}
                    >
                        <b>Value {index}:</b>
                        &nbsp;
                        {valueToString(selection.properties.values[index])}
                    </div>
                )}
            </Popup>
            }
        </Map>
    );
}

const polygonStyles = [0, 1, 2].map(index =>
    (f: Feature<Polygon, PolygonProperties>) => ({color: valueToColor(f.properties.values[index])})
);

function valueToString(value: number): string {
    return (100 * value).toFixed(2) + '%';
}

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

function rgbColorToCss(color: Color) {
    const r = Math.round(255 * color.r);
    const g = Math.round(255 * color.g);
    const b = Math.round(255 * color.b);
    return `rgb(${r}, ${g}, ${b})`;
}
