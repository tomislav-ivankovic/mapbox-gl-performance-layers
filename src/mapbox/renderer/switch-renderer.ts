import {Renderer} from './renderer';
import * as glMatrix from 'gl-matrix';

export interface SwitchOption<D> {
    renderer: Renderer<D>,
    condition: (data: D) => boolean,
}

export class SwitchRenderer<D> implements Renderer<D> {
    private gl: WebGLRenderingContext | null = null;
    private currentOption = this.options[0];

    constructor(
        private options: SwitchOption<D>[]
    ){
        if (options.length === 0) {
            throw Error('SwitchRenderer must have at least 1 rendering option.');
        }
    }

    setData(data: D): void {
        const currentOption = this.currentOption;
        if (!currentOption.condition(data)) {
            const find = this.options.find(option => option.condition(data));
            const newOption = find != null ? find : this.options[this.options.length - 1];
            if (newOption !== currentOption) {
                if (this.gl != null) {
                    currentOption.renderer.dispose(this.gl);
                    newOption.renderer.initialise(this.gl);
                }
                this.currentOption = newOption;
            }
        }
        this.currentOption.renderer.setData(data);
    }

    initialise(gl: WebGLRenderingContext): void {
        this.currentOption.renderer.initialise(gl);
        this.gl = gl;
    }

    dispose(gl: WebGLRenderingContext): void {
        this.gl = null;
        this.currentOption.renderer.dispose(gl);
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        this.currentOption.renderer.prerender(gl, matrix);
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        this.currentOption.renderer.render(gl, matrix);
    }
}
