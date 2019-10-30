import * as glMatrix from 'gl-matrix';

export interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

export function findViewBoundsFromMatrix(matrix: number[]): [number, number, number, number] {
    if (matrix.length !== 16) {
        throw Error('Input matrix must pe a 4x4 size. The array must contain 16 elements.');
    }

    const invertedMatrix = glMatrix.mat4.fromValues(
        matrix[0], matrix[1], matrix[2], matrix[3],
        matrix[4], matrix[5], matrix[6], matrix[7],
        matrix[8], matrix[9], matrix[10], matrix[11],
        matrix[12], matrix[13], matrix[14], matrix[15]
    );
    glMatrix.mat4.invert(invertedMatrix, invertedMatrix);

    const points = [
        glMatrix.vec4.fromValues(-1, -1, 1, 1),
        glMatrix.vec4.fromValues(-1, 1, 1, 1),
        glMatrix.vec4.fromValues(1, -1, 1, 1),
        glMatrix.vec4.fromValues(1, 1, 1, 1)
    ];

    let minX = +Infinity, minY = +Infinity, maxX = -Infinity, maxY = -Infinity;
    points.forEach(point => {
        glMatrix.vec4.transformMat4(point, point, invertedMatrix);
        const values = Array.from(point.values());
        const x = values[0]/values[3];
        const y = values[1]/values[3];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    });

    return [minX, minY, maxX, maxY];
}
