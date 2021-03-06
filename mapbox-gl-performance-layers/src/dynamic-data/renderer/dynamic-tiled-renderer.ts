import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {DynamicRenderer} from './dynamic-renderer';
import {DataOperations} from '../data-operations';
import {StyleOption} from '../../shared/styles';
import {TileRenderer, TileRendererOptions} from '../../shared/tile/tile-renderer';
import {Bounds, findFeatureBounds, findFeaturesBounds} from '../../shared/geometry-functions';
import * as glMatrix from 'gl-matrix';

export class DynamicTiledRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    private tileRenderer: TileRenderer;
    private readonly dataBounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };
    private readonly tempBounds: Bounds = {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity
    };

    constructor(
        private renderer: DynamicRenderer<G, P, S>,
        options: TileRendererOptions
    ){
        this.tileRenderer = new TileRenderer(renderer, options);
    }

    dataOperations: DataOperations<Feature<G, P>> = {
        add: (feature: Feature<G, P>) => {
            this.renderer.dataOperations.add(feature);
            this.handleDataChange(feature);
        },
        removeFirst: () => {
            const feature = this.renderer.dataOperations.removeFirst();
            if (feature != null) {
                this.handleDataChange(feature);
            }
            return feature;
        },
        removeLast: () => {
            const feature = this.renderer.dataOperations.removeLast();
            if (feature != null) {
                this.handleDataChange(feature);
            }
            return feature;
        },
        clear: () => {
            this.renderer.dataOperations.clear();
            this.tileRenderer.markAllTilesOutdated();
        },
        getArray: () => {
            return this.renderer.dataOperations.getArray();
        },
        addAll: (features: Feature<G, P>[]) => {
            this.renderer.dataOperations.addAll(features);
            for (const feature of features) {
                this.handleDataChange(feature);
            }
        },
        removeNFirst: (n: number) => {
            const features = this.renderer.dataOperations.removeNFirst(n);
            for (const feature of features) {
                this.handleDataChange(feature);
            }
            return features;
        },
        removeNLast: (n: number) => {
            const features = this.renderer.dataOperations.removeNLast(n);
            for (const feature of features) {
                this.handleDataChange(feature);
            }
            return features;
        }
    };

    setStyle(styleOption: StyleOption<G, P, S>): void {
        this.renderer.setStyle(styleOption);
        this.tileRenderer.markAllTilesOutdated();
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.tileRenderer.initialise(map, gl);
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.tileRenderer.dispose(map, gl);
    }

    prerender(): void {
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        this.tileRenderer.render(gl, matrix, this.dataBounds);
    }

    private handleDataChange(feature: Feature<G, P>) {
        const bounds = this.tempBounds;
        findFeatureBounds(bounds, feature);
        this.tileRenderer.markOutdatedTiles(bounds);
        const dataBoundsChanged = this.dataBounds == null ||
            bounds.minX <= this.dataBounds.minX ||
            bounds.minY <= this.dataBounds.minY ||
            bounds.maxX >= this.dataBounds.maxX ||
            bounds.maxY >= this.dataBounds.maxY;
        if (dataBoundsChanged) {
            findFeaturesBounds(this.dataBounds, this.dataOperations.getArray());
        }
    }
}

