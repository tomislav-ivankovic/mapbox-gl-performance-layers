import {Renderer} from './renderer';
import * as glMatrix from 'gl-matrix';

export interface SwitchOption<D> {
    renderer: Renderer<D>,
    condition: (data: D) => boolean,
}

export class SwitchRenderer<D> implements Renderer<D> {
    private gl: WebGLRenderingContext | null = null;
    private currentOption: SwitchOption<D> | null = null;

    constructor(
        private options: SwitchOption<D>[]
    ){
    }

    setData(data: D): void {
        const currentOption = this.currentOption;
        if (currentOption == null || !currentOption.condition(data)) {
            const newOption = this.options.find(option => option.condition(data));
            if (newOption !== currentOption) {
                if (this.gl != null) {
                    if (currentOption != null) {
                        currentOption.renderer.dispose(this.gl);
                    }
                    if (newOption != null) {
                        newOption.renderer.initialise(this.gl);
                    }
                }
                this.currentOption = newOption != null ? newOption : null;
            }
        }
        if (this.currentOption != null) {
            this.currentOption.renderer.setData(data);
        }
    }

    initialise(gl: WebGLRenderingContext): void {
        if (this.currentOption != null) {
            this.currentOption.renderer.initialise(gl);
        }
        this.gl = gl;
    }

    dispose(gl: WebGLRenderingContext): void {
        this.gl = null;
        if (this.currentOption != null) {
            this.currentOption.renderer.dispose(gl);
        }
    }

    prerender(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        if (this.currentOption != null) {
            this.currentOption.renderer.prerender(gl, matrix);
        }
    }

    render(gl: WebGLRenderingContext, matrix: glMatrix.mat4 | number[]): void {
        if (this.currentOption != null) {
            this.currentOption.renderer.render(gl, matrix);
        }
    }
}
