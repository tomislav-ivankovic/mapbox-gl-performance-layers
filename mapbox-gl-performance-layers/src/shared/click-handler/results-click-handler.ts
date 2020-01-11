import {Geometry} from 'geojson';
import {PackedFeature} from '../geometry-functions';
import {EventData} from 'mapbox-gl';
import {MapMouseEvent} from 'mapbox-gl';

export type ResultsClickHandler<G extends Geometry, P> = (
    x: number,
    y: number,
    size: number,
    results: PackedFeature<G, P>[],
    e: MapMouseEvent & EventData
) => void;
