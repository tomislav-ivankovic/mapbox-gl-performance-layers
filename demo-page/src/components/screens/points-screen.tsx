import React, {useState} from 'react';
import {Map} from '../reusable/map';
import {Feature, FeatureCollection, Point} from 'geojson';
import {PointLayer} from 'react-mapbox-gl-performance-layers';
import {Popup} from 'react-mapbox-gl';

export function PointsScreen() {
    const [data] = useState(() => {
        const numberOfPoints = 1000000;
        const centerX = 15.9819;
        const centerY = 45.8150;
        const spread = 10;
        const points: [number, number][] = [];
        for (let i = 0; i < numberOfPoints; i++) {
            const x = centerX + (Math.random() - 0.5) * spread;
            const y = centerY + (Math.random() - 0.5) * spread;
            points.push([x, y]);
        }
        const featureCollection: FeatureCollection<Point, null> = {
            type: 'FeatureCollection',
            features: points.map(p => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: p
                },
                properties: null
            }))
        };
        return featureCollection;
    });

    const [selection, setSelection] = useState<Feature<Point, null> | null>(null);

    const handleClick = (feature: Feature<Point, null>) => {
        const newSelected = feature !== selection ? feature : null;
        setSelection(newSelected);
    };

    return (
        <Map>
            <PointLayer
                data={data}
                style={getStyle}
                onClick={handleClick}
                simpleRendering
            />
            {selection != null &&
            <Popup coordinates={selection.geometry.coordinates}>
                <p>{JSON.stringify(selection, null, 1)}</p>
            </Popup>
            }
        </Map>
    );
}

function getStyle(feature: Feature<Point, null>) {
    const x = feature.geometry.coordinates[0];
    const y = feature.geometry.coordinates[1];
    return {
        size: 8 + 2 * Math.sin(x - y),
        color: {
            r: x - Math.floor(x),
            g: y - Math.floor(y),
            b: 0.5 + 0.5 * Math.sin(x + y)
        },
        opacity: 0.5
    };
}
