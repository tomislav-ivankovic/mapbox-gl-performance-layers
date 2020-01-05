import {DefaultShader} from '../default/default-shader';

export class SimplePolygonShader extends DefaultShader {
    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.TRIANGLES;
    }
}
