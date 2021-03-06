import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {BaseDataOperations} from '../data-operations';
import {StyleOption} from '../../shared/styles';
import {DynamicVertexDataMapper} from '../vertex-data-mapper/dynamic-vertex-data-mapper';

export class DynamicShaderDataCollection<G extends Geometry, P, S extends {}> implements BaseDataOperations<Feature<G, P>> {
    private styleOption: StyleOption<G, P, S> = undefined;
    private features: Feature<G, P>[] = [];
    private buffer: Float32Array;
    private startIndex = 0;
    private endIndex = 0;

    constructor(
        private vertexDataMapper: DynamicVertexDataMapper<G, P, S>,
        startingBufferSize: number
    ) {
        this.buffer = new Float32Array(startingBufferSize);
    }

    add(feature: Feature<G, P>): void {
        const mapped = this.vertexDataMapper(feature, this.styleOption);
        if (this.endIndex + mapped.length >= this.buffer.length) {
            this.resetBuffer();
        }
        this.buffer.set(mapped, this.endIndex);
        this.endIndex += mapped.length;
        this.features.push(feature);
    }

    removeFirst(): Feature<G, P> | null {
        const feature = this.features.shift();
        if (feature != null) {
            const mapped = this.vertexDataMapper(feature, this.styleOption);
            this.startIndex += mapped.length;
        }
        return feature != null ? feature : null;
    }

    removeLast(): Feature<G, P> | null {
        const feature = this.features.pop();
        if (feature != null) {
            const mapped = this.vertexDataMapper(feature, this.styleOption);
            this.endIndex -= mapped.length;
        }
        return feature != null ? feature : null;
    }

    clear(): void {
        this.features.length = 0;
        this.startIndex = 0;
        this.endIndex = 0;
    }

    setStyle(styleOption: StyleOption<G, P, S>): void {
        this.styleOption = styleOption;
        this.startIndex = 0;
        this.endIndex = 0;
        for (const feature of this.features) {
            const mapped = this.vertexDataMapper(feature, this.styleOption);
            this.buffer.set(mapped, this.endIndex);
            this.endIndex += mapped.length;
        }
    }

    private resetBuffer() {
        const currentSize = this.endIndex - this.startIndex;
        this.buffer.copyWithin(0, this.startIndex, this.endIndex);
        this.startIndex = 0;
        this.endIndex = currentSize;
        if (this.buffer.length >= 2 * currentSize) {
            return;
        }
        const newBuffer = new Float32Array(2 * this.buffer.length);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    public getArray(): ReadonlyArray<Feature<G, P>> {
        return this.features;
    }

    public getVertexArray(): Float32Array {
        return this.buffer;
    }

    public getStartIndex(): number {
        return this.startIndex;
    }

    public getEndIndex(): number {
        return this.endIndex;
    }
}
