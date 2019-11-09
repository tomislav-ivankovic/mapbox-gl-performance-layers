import {Feature, FeatureCollection, LineString} from 'geojson';
import {Shader, ShaderBuffers, transformX, transformY} from '../shader';
import {defaultLineStyle, LineStyle} from '../../renderer-presets/line-renderer';
import * as glMatrix from 'gl-matrix';
import vertexSource from './fancy-line.vert';
import fragmentSource from './fancy-line.frag';

export class FancyLineShader<P> implements Shader<FeatureCollection<LineString, P>> {
    vertexSource = vertexSource;
    fragmentSource = fragmentSource;

    constructor(
        private style?: (feature: Feature<LineString, P>) => Partial<LineStyle>,
        private interpolation: number = 1.8
    ) {
    }

    configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void {
        const previousPosition = gl.getAttribLocation(program, 'a_previousPosition');
        const currentPosition = gl.getAttribLocation(program, 'a_currentPosition');
        const nextPosition = gl.getAttribLocation(program, 'a_nextPosition');
        const size = gl.getAttribLocation(program, 'a_size');
        const color = gl.getAttribLocation(program, 'a_color');
        const outlineSize = gl.getAttribLocation(program, 'a_outlineSize');
        const outlineColor = gl.getAttribLocation(program, 'a_outlineColor');
        const vertexSize = 16 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(
            previousPosition,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            0
        );
        gl.vertexAttribPointer(
            currentPosition,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            2 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            nextPosition,
            2,
            gl.FLOAT,
            false,
            vertexSize,
            4 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            size,
            1,
            gl.FLOAT,
            false,
            vertexSize,
            6 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            outlineSize,
            1,
            gl.FLOAT,
            false,
            vertexSize,
            7 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            color,
            4,
            gl.FLOAT,
            false,
            vertexSize,
            8 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.vertexAttribPointer(
            outlineColor,
            4,
            gl.FLOAT,
            false,
            vertexSize,
            12 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(previousPosition);
        gl.enableVertexAttribArray(currentPosition);
        gl.enableVertexAttribArray(nextPosition);
        gl.enableVertexAttribArray(size);
        gl.enableVertexAttribArray(color);
        gl.enableVertexAttribArray(outlineSize);
        gl.enableVertexAttribArray(outlineColor);
    }

    dataToArrays(data: FeatureCollection<LineString, P>): ShaderBuffers {
        const array: number[] = [];
        const elementsArray: number[] = [];
        let currentIndex = 0;
        for (const feature of data.features) {
            if (feature.geometry.coordinates.length < 2) {
                continue;
            }
            const style = this.style != null ? {...defaultLineStyle, ...this.style(feature)} : defaultLineStyle;
            const coords = feature.geometry.coordinates;
            for (let i = 0; i < coords.length; i++) {
                const currentX = transformX(coords[i][0]);
                const currentY = transformY(coords[i][1]);
                let previousX: number, previousY: number, nextX: number, nextY: number;
                if (i === 0) {
                    nextX = transformX(coords[i + 1][0]);
                    nextY = transformY(coords[i + 1][1]);
                    previousX = 2 * currentX - nextX;
                    previousY = 2 * currentY - nextY;
                } else if (i === feature.geometry.coordinates.length - 1) {
                    previousX = transformX(coords[i - 1][0]);
                    previousY = transformY(coords[i - 1][1]);
                    nextX = 2 * currentX - previousX;
                    nextY = 2 * currentY - previousY;
                } else {
                    previousX = transformX(coords[i - 1][0]);
                    previousY = transformY(coords[i - 1][1]);
                    nextX = transformX(coords[i + 1][0]);
                    nextY = transformY(coords[i + 1][1]);
                }
                const x1 = previousX - currentX, y1 = previousY - currentY;
                const x2 = nextX - currentX, y2 = nextY - currentY;
                const dot = x1 * x2 + y1 * y2;
                const length1 = Math.sqrt(x1 * x1 + y1 * y1);
                const length2 = Math.sqrt(x2 * x2 + y2 * y2);
                const cosAngle = dot / (length1 * length2);
                if (cosAngle < 0.8) {
                    array.push(
                        previousX, previousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.size,
                        style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                        ,
                        previousX, previousY,
                        currentX, currentY,
                        nextX, nextY,
                        -style.size,
                        -style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                    );
                    if (i !== 0) {
                        elementsArray.push(
                            currentIndex, currentIndex - 2, currentIndex - 1,
                            currentIndex, currentIndex - 1, currentIndex + 1
                        );
                    }
                    currentIndex += 2;
                } else {
                    const fakePreviousX = 2 * currentX - nextX;
                    const fakePreviousY = 2 * currentY - nextY;
                    const fakeNextX = 2 * currentX - previousX;
                    const fakeNextY = 2 * currentY - previousY;
                    array.push(
                        previousX, previousY,
                        currentX, currentY,
                        fakeNextX, fakeNextY,
                        style.size,
                        style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                        ,
                        previousX, previousY,
                        currentX, currentY,
                        fakeNextX, fakeNextY,
                        -style.size,
                        -style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                        ,
                        fakePreviousX, fakePreviousY,
                        currentX, currentY,
                        nextX, nextY,
                        style.size,
                        style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                        ,
                        fakePreviousX, fakePreviousY,
                        currentX, currentY,
                        nextX, nextY,
                        -style.size,
                        -style.outlineSize,
                        style.color.r, style.color.g, style.color.b, style.color.a,
                        style.outlineColor.r, style.outlineColor.g, style.outlineColor.b, style.outlineColor.a
                    );
                    if (i !== 0) {
                        elementsArray.push(
                            currentIndex, currentIndex - 2, currentIndex - 1,
                            currentIndex, currentIndex - 1, currentIndex + 1
                        );
                    }
                    currentIndex += 4;
                }
            }
        }
        return {
            array: new Float32Array(array),
            elementArray: new Int32Array(elementsArray)
        };
    }

    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void {
        const viewport = gl.getParameter(gl.VIEWPORT) as [number, number, number, number];
        gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_matrix'), false, matrix);
        gl.uniform2f(gl.getUniformLocation(program, 'u_viewPortSize'), viewport[2], viewport[3]);
        gl.uniform1f(gl.getUniformLocation(program, 'u_interpolation'), this.interpolation);
    }

    getArrayBufferElementsPerVertex(): number {
        return 16;
    }

    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLES;
    }
}
