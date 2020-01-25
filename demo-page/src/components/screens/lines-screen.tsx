import React, {useState} from 'react';
import {Feature, FeatureCollection, LineString} from 'geojson';
import {Map} from '../reusable/map';
import {LineLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';
import {EventData, MapMouseEvent} from 'mapbox-gl';

type Selection = {
    coordinates: [number, number];
    feature: Feature<LineString, null>;
} | null;

export function LinesScreen() {
    const [data] = useState(() => {
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
        const featureCollection: FeatureCollection<LineString, null> = {
            type: 'FeatureCollection',
            features: lines.map(l => ({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: l
                },
                properties: null
            }))
        };
        return featureCollection;
    });

    const [selection, setSelection] = useState<Selection>(null);

    const handleClick = (
        feature: Feature<LineString, null>,
        e: MapMouseEvent & EventData,
        closestPointOnLine: { x: number; y: number; }
    ) => {
        if (selection != null && selection.feature === feature) {
            setSelection(null);
            return;
        }
        setSelection({
            coordinates: [closestPointOnLine.x, closestPointOnLine.y],
            feature: feature
        });
    };

    return (
        <Map>
            <LineLayer
                data={data}
                style={getStyle}
                onClick={handleClick}
            />
            {selection != null &&
            <Popup coordinates={selection.coordinates}>
                <p>{JSON.stringify(selection.feature, null, 1)}</p>
            </Popup>
            }
        </Map>
    );
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
