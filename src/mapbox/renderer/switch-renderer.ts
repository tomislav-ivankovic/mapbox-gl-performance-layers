import {Renderer} from './renderer';
import * as glMatrix from 'gl-matrix';

export interface SwitchOption<D> {
    renderer: Renderer<D>,
    condition: (data: D) => boolean,
}

export class SwitchRenderer<D> implements Renderer<D> {
    private map: mapboxgl.Map | null = null;
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
                    if (this.map != null && currentOption != null) {
                        currentOption.renderer.dispose(this.map, this.gl);
                    }
                    if (this.map != null && newOption != null) {
                        newOption.renderer.initialise(this.map, this.gl);
                    }
                }
                this.currentOption = newOption != null ? newOption : null;
            }
        }
        if (this.currentOption != null) {
            this.currentOption.renderer.setData(data);
        }
    }

    initialise(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        if (this.currentOption != null) {
            this.currentOption.renderer.initialise(map, gl);
        }
        this.map = map;
        this.gl = gl;
    }

    dispose(map: mapboxgl.Map, gl: WebGLRenderingContext): void {
        this.gl = null;
        this.map = null;
        if (this.currentOption != null) {
            this.currentOption.renderer.dispose(map, gl);
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
