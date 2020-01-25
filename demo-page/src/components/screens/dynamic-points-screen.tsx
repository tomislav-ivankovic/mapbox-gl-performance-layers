import React, {useEffect, useRef, useState} from 'react';
import {Map} from '../reusable/map';
import {Feature, Point} from 'geojson';
import {Popup} from 'react-mapbox-gl';
import {DynamicPointLayer} from 'react-mapbox-gl-performance-layers';
import {Color, DataOperations} from 'mapbox-gl-performance-layers';

interface Properties {
    color: Color;
}

export function DynamicPointsScreen() {
    const dataOperationsRef = useRef<DataOperations<Feature<Point, Properties>> | null>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const data = dataOperationsRef.current;
            if (data == null) {
                return;
            }

            const maxNumberOfPoints = 100000;
            const numberOfPointsPerInterval = 1000;
            const centerX = 15.9819;
            const centerY = 45.8150;
            const spread = 10;

            if (data.getArray().length + numberOfPointsPerInterval > maxNumberOfPoints) {
                data.removeNFirst(numberOfPointsPerInterval);
            }

            const features: Feature<Point, Properties>[] = [];
            for (let i = 0; i < numberOfPointsPerInterval; i++) {
                const x = centerX + (Math.random() - 0.5) * spread;
                const y = centerY + (Math.random() - 0.5) * spread;
                features.push({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [x, y]
                    },
                    properties: {
                        color: {
                            r: Math.random(),
                            g: Math.random(),
                            b: Math.random()
                        }
                    }
                });
            }
            data.addAll(features);
        }, 250);
        return () => clearInterval(intervalId);
    });

    const [selection, setSelection] = useState<Feature<Point, Properties> | null>(null);

    const handleClick = (feature: Feature<Point, Properties>) => {
        const newSelected = feature !== selection ? feature : null;
        setSelection(newSelected);
    };

    return (
        <Map>
            <DynamicPointLayer
                data={dataOperations => dataOperationsRef.current = dataOperations}
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

function getStyle(feature: Feature<Point, Properties>) {
    return {
        size: 8,
        color: feature.properties.color,
    };
}
