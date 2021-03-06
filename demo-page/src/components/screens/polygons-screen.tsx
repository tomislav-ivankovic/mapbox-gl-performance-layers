import React, {useState} from 'react';
import {Feature, FeatureCollection, Polygon} from 'geojson';
import {Map} from '../reusable/map';
import {PolygonLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';

interface Properties {
    center: [number, number]
}

export function PolygonsScreen() {
    const [data] = useState(() => {
        const numberOfPolygons = 10000;
        const numberOfPointsInPolygons = 7;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const polygonSpread = 0.1;
        const deltaAngle = 2 * Math.PI / numberOfPointsInPolygons;
        const features: Feature<Polygon, Properties>[] = [];
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
            features.push({
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [edgePoints, holePoints]
                },
                properties: {
                    center: [cX, cY]
                }
            });
        }
        const featureCollection: FeatureCollection<Polygon, Properties> = {
            type: 'FeatureCollection',
            features: features
        };
        return featureCollection;
    });

    const [selection, setSelection] = useState<Feature<Polygon, Properties> | null>(null);

    const handleClick = (feature: Feature<Polygon, Properties>) => {
        const newSelected = feature !== selection ? feature : null;
        setSelection(newSelected);
    };

    return (
        <Map>
            <PolygonLayer
                data={data}
                style={getStyle}
                onClick={handleClick}
            />
            {selection != null &&
            <Popup coordinates={selection.properties.center}>
                <p>{JSON.stringify(selection, null, 1)}</p>
            </Popup>
            }
        </Map>
    );
}

function getStyle(feature: Feature<Polygon, Properties>) {
    const x = feature.geometry.coordinates[0][0][0];
    const y = feature.geometry.coordinates[0][0][1];
    return {
        color: {
            r: x - Math.floor(x),
            g: y - Math.floor(y),
            b: 0.5 + 0.5 * Math.sin(x + y)
        },
        opacity: 0.5,
        outlineSize: 1.8
    };
}
