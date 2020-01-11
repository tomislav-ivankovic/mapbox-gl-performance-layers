import {FeatureCollection} from 'geojson';
import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';

export function transformX(lng: number): number {
    return (180 + lng) / 360;
}

export function transformY(lat: number): number {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

export function pointToPointDistanceSqr(x1: number, y1: number, x2: number, y2: number): number {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

export function pointToMultiPointDistanceSqr(x: number, y: number, point: Point | MultiPoint): number {
    if (point.type == 'Point') {
        const coords = point.coordinates;
        return pointToPointDistanceSqr(x, y, coords[0], coords[1]);
    } else {
        let minDistanceSqr = Infinity;
        for (const coords of point.coordinates) {
            const distanceSqr = pointToPointDistanceSqr(x, y, coords[0], coords[1]);
            if (distanceSqr < minDistanceSqr) {
                minDistanceSqr = distanceSqr;
            }
        }
        return minDistanceSqr;
    }
}

const tempPoint = {x: 0, y: 0};

export function closestPointOnLine(
    output: { x: number, y: number },
    x: number,
    y: number,
    line: LineString | MultiLineString
): void {
    if (line.type === 'LineString') {
        closestPointOnSingleLine(output, x, y, line.coordinates);
    } else {
        let minDistanceSqr = Infinity;
        let closestX = 0;
        let closestY = 0;
        for (const coords of line.coordinates) {
            const point = tempPoint;
            closestPointOnSingleLine(point, x, y, coords);
            const distanceSqr = pointToPointDistanceSqr(x, y, point.x, point.y);
            if (distanceSqr < minDistanceSqr) {
                minDistanceSqr = distanceSqr;
                closestX = point.x;
                closestY = point.y;
            }
        }
        output.x = closestX;
        output.y = closestY;
    }
}

function closestPointOnSingleLine(
    output: { x: number, y: number },
    x: number,
    y: number,
    coordinates: number[][]
): void {
    let minDistanceSqr = Infinity;
    let closestX = x;
    let closestY = y;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const [x1, y1] = coordinates[i];
        const [x2, y2] = coordinates[i + 1];
        const segmentLengthSqr = pointToPointDistanceSqr(x1, y1, x2, y2);
        let projectionX = x1;
        let projectionY = y1;
        if (segmentLengthSqr > 0) {
            const projectionFactor = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / segmentLengthSqr;
            const projectionFactorClamped = Math.max(0, Math.min(1, projectionFactor));
            projectionX = x1 + projectionFactorClamped * (x2 - x1);
            projectionY = y1 + projectionFactorClamped * (y2 - y1);
        }
        const distanceSqr = pointToPointDistanceSqr(x, y, projectionX, projectionY);
        if (distanceSqr < minDistanceSqr) {
            minDistanceSqr = distanceSqr;
            closestX = projectionX;
            closestY = projectionY;
        }
    }
    output.x = closestX;
    output.y = closestY;
}

export function isPointInPolygon(x: number, y: number, polygon: Polygon | MultiPolygon): boolean {
    if (polygon.type == 'Polygon') {
        return isPointInSinglePolygon(x, y, polygon.coordinates);
    } else {
        for (const coords of polygon.coordinates) {
            if (isPointInSinglePolygon(x, y, coords)) {
                return true;
            }
        }
        return false;
    }
}

function isPointInSinglePolygon(x: number, y: number, coordinates: number[][][]): boolean {
    if (coordinates.length === 0 || !isPointInPolygonNoHoles(x, y, coordinates[0])) {
        return false;
    }
    for (let i = 1; i < coordinates.length; i++) {
        const coords = coordinates[i];
        if (isPointInPolygonNoHoles(x, y, coords)) {
            return false;
        }
    }
    return true;
}

function isPointInPolygonNoHoles(x: number, y: number, coords: number[][]): boolean {
    let isInside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
        const xi = coords[i][0], yi = coords[i][1];
        const xj = coords[j][0], yj = coords[j][1];
        const doseIntersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (doseIntersect) {
            isInside = !isInside;
        }
    }
    return isInside;
}

export function cosOfPointsAngle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): number {
    return cosOfAngleBetweenVectors(x2 - x1, y2 - y1, x2 - x3, y2 - y3);
}

export function cosOfAngleBetweenVectors(x1: number, y1: number, x2: number, y2: number): number {
    const dot = x1 * x2 + y1 * y2;
    const length1 = Math.sqrt(x1 * x1 + y1 * y1);
    const length2 = Math.sqrt(x2 * x2 + y2 * y2);
    return dot / (length1 * length2);
}

export interface Bounds {
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
}

export function findViewBounds(output: Bounds, map: mapboxgl.Map): void {
    const bounds = map.getBounds();
    output.minX = transformX(bounds.getWest());
    output.minY = transformY(bounds.getNorth());
    output.maxX = transformX(bounds.getEast());
    output.maxY = transformY(bounds.getSouth());
}

interface Coordinates {
    [index: number]: (Coordinates | number);
    length: number;
}

export function findFeatureCollectionBounds(output: Bounds, featureCollection: FeatureCollection<Geometry, any>): void {
    output.minX = Infinity;
    output.minY = Infinity;
    output.maxX = -Infinity;
    output.maxY = -Infinity;
    for (const feature of featureCollection.features) {
        findGeometryBounds(output, feature.geometry);
    }
}

export function findFeaturesBounds(output: Bounds, features: ReadonlyArray<Feature<Geometry, any>>): void {
    output.minX = Infinity;
    output.minY = Infinity;
    output.maxX = -Infinity;
    output.maxY = -Infinity;
    for (const feature of features) {
        findGeometryBounds(output, feature.geometry);
    }
}

export function findFeatureBounds(output: Bounds, feature: Feature<Geometry, any>): void {
    output.minX = Infinity;
    output.minY = Infinity;
    output.maxX = -Infinity;
    output.maxY = -Infinity;
    findGeometryBounds(output, feature.geometry);
}

function findGeometryBounds(output: Bounds, geometry: Geometry): void {
    if (geometry.type === 'GeometryCollection') {
        for (const g of geometry.geometries) {
            findGeometryBounds(output, g);
        }
    } else {
        findCoordinatesBounds(output, geometry.coordinates);
    }
}

function findCoordinatesBounds(output: Bounds, coords: Coordinates): void {
    for (let i = 0; i < coords.length; i++) {
        const c = coords[i];
        if (typeof c === 'number') {
            if (i === 0) {
                if (c < output.minX) output.minX = c;
                if (c > output.maxX) output.maxX = c;
            } else if (i === 1) {
                if (c < output.minY) output.minY = c;
                if (c > output.maxY) output.maxY = c;
            }
        } else {
            findCoordinatesBounds(output, c);
        }
    }
}

export interface PackedFeature<G extends Geometry, P> extends Bounds {
    feature: Feature<G, P>;
    index: number;
}

export function packFeature<G extends Geometry, P>(feature: Feature<G, P>, index: number) {
    const packed: PackedFeature<G, P> = {
        feature: feature,
        index: index,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    findFeatureBounds(packed, feature);
    return packed;
}
