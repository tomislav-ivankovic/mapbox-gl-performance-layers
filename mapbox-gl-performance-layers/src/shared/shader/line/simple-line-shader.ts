import {DefaultShader} from '../default/default-shader';

export class SimpleLineShader<P> extends DefaultShader {
    getPrimitiveType(gl: WebGLRenderingContext): number {
        return gl.LINES;
    }
}
