import * as glMatrix from 'gl-matrix';

export interface ShaderBuffers {
    array: Float32Array;
    elementArray: Int32Array | null;
}

export interface Shader<D> {
    vertexSource: string,
    fragmentSource: string,
    configureAttributes(gl: WebGLRenderingContext, program: WebGLProgram): void;
    dataToArrays(data: D): ShaderBuffers;
    setUniforms(gl: WebGLRenderingContext, program: WebGLProgram, matrix: glMatrix.mat4 | number[]): void;
    getArrayBufferElementsPerVertex(): number;
    getPrimitiveType(gl: WebGLRenderingContext): GLenum;
}

export function createShaderProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string): WebGLProgram {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (vertexShader == null) {
        throw Error('Vertex shader is NULL.');
    }
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw Error('ERROR compiling vertex shader! ' + gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (fragmentShader == null) {
        throw Error('Fragment shader is NULL.');
    }
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw Error('ERROR compiling fragment shader! ' + gl.getShaderInfoLog(fragmentShader));
    }

    const program = gl.createProgram();
    if (program == null) {
        throw Error('Program is NULL.');
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw Error('ERROR linking program! ' + gl.getProgramInfoLog(program));
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        throw Error('ERROR validating program! ' + gl.getProgramInfoLog(program));
    }
    return program;
}

export function transformX(lng: number) {
    return (180 + lng) / 360;
}

export function transformY(lat: number) {
    return (180 - (180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)))) / 360;
}
