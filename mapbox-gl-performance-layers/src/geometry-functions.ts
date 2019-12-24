import {FeatureCollection, LineString, Point, Polygon} from 'geojson';

export function transformX(lng: number) {
    return (180 + lng) / 360;
}

export function transformY(lat: number) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}

export function pointToPointDistanceSqr(x1: number, y1: number, x2: number, y2: number): number {
    return (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
}

export function closestPointOnLine(x: number, y: number, line: LineString): { x: number, y: number } {
    let minDistanceSqr = Infinity;
    let closestX = x;
    let closestY = y;
    for (let i = 0; i < line.coordinates.length - 1; i++) {
        const [x1, y1] = line.coordinates[i];
        const [x2, y2] = line.coordinates[i + 1];
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

export function isPointInPolygon(x: number, y: number, polygon: Polygon): boolean {
    if (polygon.coordinates.length === 0 || !isPointInPolygonNoHoles(x, y, polygon.coordinates[0])) {
        return false;
    }
    for (let i = 1; i < polygon.coordinates.length; i++) {
        const coords = polygon.coordinates[i];
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

export function findPointCollectionBounds(data: FeatureCollection<Point, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        const coords = feature.geometry.coordinates;
        if (coords[0] < bounds.minX) bounds.minX = coords[0];
        if (coords[1] < bounds.minY) bounds.minY = coords[1];
        if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
        if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
    }
    return bounds;
}

export function findLineStringCollectionBounds(data: FeatureCollection<LineString, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        for (const coords of feature.geometry.coordinates) {
            if (coords[0] < bounds.minX) bounds.minX = coords[0];
            if (coords[1] < bounds.minY) bounds.minY = coords[1];
            if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
            if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
        }
    }
    return bounds;
}

export function findPolygonCollectionBounds(data: FeatureCollection<Polygon, any>): Bounds {
    const bounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    for (const feature of data.features) {
        for (const coordinates of feature.geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < bounds.minX) bounds.minX = coords[0];
                if (coords[1] < bounds.minY) bounds.minY = coords[1];
                if (coords[0] > bounds.maxX) bounds.maxX = coords[0];
                if (coords[1] > bounds.maxY) bounds.maxY = coords[1];
            }
        }
    }
    return bounds;
}

export function addLineStringCollectionBoundingBoxes<P>(data: FeatureCollection<LineString, P>): void {
    for (const feature of data.features) {
        if (feature.bbox != null) {
            continue;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const coords of feature.geometry.coordinates) {
            if (coords[0] < minX) minX = coords[0];
            if (coords[1] < minY) minY = coords[1];
            if (coords[0] > maxX) maxX = coords[0];
            if (coords[1] > maxY) maxY = coords[1];
        }
        feature.bbox = [minX, minY, maxX, maxY];
    }
}

export function addPolygonCollectionBoundingBoxes<P>(data: FeatureCollection<Polygon, P>): void {
    for (const feature of data.features) {
        if (feature.bbox != null) {
            continue;
        }
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (const coordinates of feature.geometry.coordinates) {
            for (const coords of coordinates) {
                if (coords[0] < minX) minX = coords[0];
                if (coords[1] < minY) minY = coords[1];
                if (coords[0] > maxX) maxX = coords[0];
                if (coords[1] > maxY) maxY = coords[1];
            }
        }
        feature.bbox = [minX, minY, maxX, maxY];
    }
}