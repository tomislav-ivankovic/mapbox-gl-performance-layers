import RBush, {BBox} from 'rbush';
import {Feature, Geometry} from 'geojson';

export class FeatureTree<G extends Geometry, P> extends RBush<Feature<G, P>> {
    toBBox(feature: Feature<G, P>): BBox {
        if (feature.bbox == null) {
            throw Error('Features inside the PolygonTree must have a bbox.');
        }
        return {
            minX: feature.bbox[0],
            minY: feature.bbox[1],
            maxX: feature.bbox[2],
            maxY: feature.bbox[3]
        };
    }

    compareMinX(a: Feature<G, P>, b: Feature<G, P>): number {
        if (a.bbox == null || b.bbox == null) {
            throw Error('Features inside the PolygonTree must have a bbox.');
        }
        return a.bbox[0] - b.bbox[0];
    }

    compareMinY(a: Feature<G, P>, b: Feature<G, P>): number {
        if (a.bbox == null || b.bbox == null) {
            throw Error('Features inside the PolygonTree must have a bbox.');
        }
        return a.bbox[1] - b.bbox[1];
    }
}
