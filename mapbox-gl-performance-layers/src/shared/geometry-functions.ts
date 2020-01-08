import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {LineString} from 'geojson';
import {MultiLineString} from 'geojson';
import {Point} from 'geojson';
import {MultiPoint} from 'geojson';
import {Polygon} from 'geojson';
import {MultiPolygon} from 'geojson';

export function transformX(lng: number) {
    return (180 + lng) / 360;
}

export function transformY(lat: number) {
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

export function closestPointOnLine(x: number, y: number, line: LineString | MultiLineString): { x: number, y: number } {
    if (line.type === 'LineString') {
        return closestPointOnSingleLine(x, y, line.coordinates);
    } else {
        let minDistanceSqr = Infinity;
        let closestPoint = {x: 0, y: 0};
        for (const coords of line.coordinates) {
            const point = closestPointOnSingleLine(x, y, coords);
            const distanceSqr = pointToPointDistanceSqr(x, y, point.x, point.y);
            if (distanceSqr < minDistanceSqr) {
                minDistanceSqr = distanceSqr;
                closestPoint = point;
            }
        }
        return closestPoint;
    }
}

function closestPointOnSingleLine(x: number, y: number, coordinates: number[][]): { x: number, y: number } {
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
    return {
        x: closestX,
        y: closestY
    };
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

export function cosOfPointsAngle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
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

export function findViewBounds(map: mapboxgl.Map): Bounds {
    const bounds = map.getBounds();
    return {
        minX: transformX(bounds.getWest()),
        minY: transformY(bounds.getNorth()),
        maxX: transformX(bounds.getEast()),
        maxY: transformY(bounds.getSouth())
    };
}

export function findPointBounds(feature: Feature<Point | MultiPoint, any>): Bounds {
    if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates;
        return {
            minX: coords[0],
            minY: coords[1],
            maxX: coords[0],
            maxY: coords[1]
        };
    } else {
        const bounds: Bounds = {
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
        for (const coords of feature.geometry.coordinates) {
            if (coords[0] < bounds.minX) bounds.minX = coords[0];
            if (coords[1] < bounds.minY) bounds.minY = coords[1];
            if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
            if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
        }
        return bounds;
    }
}

export function findPointsBounds(features: ReadonlyArray<Feature<Point | MultiPoint, any>>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of features) {
        if (feature.geometry.type === 'Point') {
            const coords = feature.geometry.coordinates;
            if (coords[0] < bounds.minX) bounds.minX = coords[0];
            if (coords[1] < bounds.minY) bounds.minY = coords[1];
            if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
            if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
        } else if (feature.geometry.type === 'MultiPoint') {
            for (const coords of feature.geometry.coordinates) {
                if (coords[0] < bounds.minX) bounds.minX = coords[0];
                if (coords[1] < bounds.minY) bounds.minY = coords[1];
                if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
            }
        }
    }
    return bounds;
}

export function findLinesBounds(features: ReadonlyArray<Feature<LineString | MultiLineString, any>>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of features) {
        if (feature.geometry.type === 'LineString') {
            for (const coords of feature.geometry.coordinates) {
                if (coords[0] < bounds.minX) bounds.minX = coords[0];
                if (coords[1] < bounds.minY) bounds.minY = coords[1];
                if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
            }
        } else if (feature.geometry.type === 'MultiLineString') {
            for (const coordinates of feature.geometry.coordinates) {
                for (const coords of coordinates) {
                    if (coords[0] < bounds.minX) bounds.minX = coords[0];
                    if (coords[1] < bounds.minY) bounds.minY = coords[1];
                    if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                    if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
                }
            }
        }
    }
    return bounds;
}

export function findPolygonsBounds(features: ReadonlyArray<Feature<Polygon | MultiPolygon, any>>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of features) {
        if (feature.geometry.type === 'Polygon') {
            for (const coordinates of feature.geometry.coordinates) {
                for (const coords of coordinates) {
                    if (coords[0] < bounds.minX) bounds.minX = coords[0];
                    if (coords[1] < bounds.minY) bounds.minY = coords[1];
                    if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                    if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
                }
            }
        } else if (feature.geometry.type === 'MultiPolygon') {
            for (const coordinates1 of feature.geometry.coordinates) {
                for (const coordinates2 of coordinates1) {
                    for (const coords of coordinates2) {
                        if (coords[0] < bounds.minX) bounds.minX = coords[0];
                        if (coords[1] < bounds.minY) bounds.minY = coords[1];
                        if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                        if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
                    }
                }
            }
        }
    }
    return bounds;
}

export interface PackedFeature<G extends Geometry, P> extends Bounds {
    feature: Feature<G, P>;
    index: number;
}

export function packPointFeature<G extends Point | MultiPoint, P>(
    feature: Feature<G, P>,
    index: number
): PackedFeature<G, P> {
    const packed: PackedFeature<G, P> = {
        feature: feature,
        index: index,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    if (feature.geometry.type === 'Point') {
        const geometry = feature.geometry as Point;
        const coords = geometry.coordinates;
        if (coords[0] < packed.minX) packed.minX = coords[0];
        if (coords[1] < packed.minY) packed.minY = coords[1];
        if (coords[0] > packed.maxX) packed.maxX = coords[0];
        if (coords[1] > packed.maxY) packed.maxY = coords[1];
    } else if (feature.geometry.type === 'MultiPoint') {
        const geometry = feature.geometry as MultiPoint;
        for (const coords of geometry.coordinates) {
            if (coords[0] < packed.minX) packed.minX = coords[0];
            if (coords[1] < packed.minY) packed.minY = coords[1];
            if (coords[0] > packed.maxX) packed.maxX = coords[0];
            if (coords[1] > packed.maxY) packed.maxY = coords[1];
        }
    }
    return packed;
}

export function packLineFeature<G extends LineString | MultiLineString, P>(
    feature: Feature<G, P>,
    index: number
): PackedFeature<G, P> {
    const packed: PackedFeature<G, P> = {
        feature: feature,
        index: index,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    if (feature.geometry.type === 'LineString') {
        const geometry = feature.geometry as LineString;
        for (const coords of geometry.coordinates) {
            if (coords[0] < packed.minX) packed.minX = coords[0];
            if (coords[1] < packed.minY) packed.minY = coords[1];
            if (coords[0] > packed.maxX) packed.maxX = coords[0];
            if (coords[1] > packed.maxY) packed.maxY = coords[1];
        }
    } else if (feature.geometry.type === 'MultiLineString') {
        const geometry = feature.geometry as MultiLineString;
        for (const coordinates of geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < packed.minX) packed.minX = coords[0];
                if (coords[1] < packed.minY) packed.minY = coords[1];
                if (coords[0] > packed.maxX) packed.maxX = coords[0];
                if (coords[1] > packed.maxY) packed.maxY = coords[1];
            }
        }
    }
    return packed;
}

export function packPolygonFeature<G extends Polygon | MultiPolygon, P>(
    feature: Feature<G, P>,
    index: number
): PackedFeature<G, P> {
    const packed: PackedFeature<G, P> = {
        feature: feature,
        index: index,
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    if (feature.geometry.type === 'Polygon') {
        const geometry = feature.geometry as Polygon;
        for (const coordinates of geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < packed.minX) packed.minX = coords[0];
                if (coords[1] < packed.minY) packed.minY = coords[1];
                if (coords[0] > packed.maxX) packed.maxX = coords[0];
                if (coords[1] > packed.maxY) packed.maxY = coords[1];
            }
        }
    } else if (feature.geometry.type === 'MultiPolygon') {
        const geometry = feature.geometry as MultiPolygon;
        for (const coordinates1 of geometry.coordinates) {
            for (const coordinates2 of coordinates1) {
                for (const coords of coordinates2) {
                    if (coords[0] < packed.minX) packed.minX = coords[0];
                    if (coords[1] < packed.minY) packed.minY = coords[1];
                    if (coords[0] > packed.maxX) packed.maxX = coords[0];
                    if (coords[1] > packed.maxY) packed.maxY = coords[1];
                }
            }
        }
    }
    return packed;
}
