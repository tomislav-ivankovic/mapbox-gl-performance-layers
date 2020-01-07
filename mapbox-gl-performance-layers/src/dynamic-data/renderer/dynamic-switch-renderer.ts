import {Feature} from 'geojson';
import {Geometry} from 'geojson';
import {DynamicRenderer} from './dynamic-renderer';
import {StyleOption} from '../../shared/styles';
import {DataOperations} from '../data-operations';
import * as glMatrix from 'gl-matrix';

export interface DynamicSwitchOption<G extends Geometry, P, S extends {}> {
    renderer: DynamicRenderer<G, P, S>;
    condition: (dataOperations: DataOperations<Feature<G, P>>) => boolean;
}

export class DynamicSwitchRenderer<G extends Geometry, P, S extends {}> implements DynamicRenderer<G, P, S> {
    private map: mapboxgl.Map | null = null;
    private gl: WebGLRenderingContext | null = null;
    private currentOption: DynamicSwitchOption<G, P, S> | null = null;

    constructor(
        private options: DynamicSwitchOption<G, P, S>[],
        private broadcastData = false
    ){
        this.handleDataChange();
    }

    dataOperations: DataOperations<Feature<G, P>> = {
        add: (element: Feature<G, P>) => {
            if (this.broadcastData) {
                for (const option of this.options) {
                    option.renderer.dataOperations.add(element);
                }
            } else if (this.currentOption != null) {
                this.currentOption.renderer.dataOperations.add(element);
            }
            this.handleDataChange();
        },
        removeFirst: () => {
            let removed: Feature<G, P> | null = null;
            if (this.broadcastData) {
                for (const option of this.options) {
                    removed = option.renderer.dataOperations.removeFirst();
                }
            } else if (this.currentOption != null) {
                removed = this.currentOption.renderer.dataOperations.removeFirst();
            }
            this.handleDataChange();
            return removed;
        },
        removeLast: () => {
            let removed: Feature<G, P> | null = null;
            if (this.broadcastData) {
                for (const option of this.options) {
                    removed = option.renderer.dataOperations.removeLast();
                }
            } else if (this.currentOption != null) {
                removed = this.currentOption.renderer.dataOperations.removeLast();
            }
            this.handleDataChange();
            return removed;
        },
        clear: () => {
            if (this.broadcastData) {
                for (const option of this.options) {
                    option.renderer.dataOperations.clear();
                }
            } else if (this.currentOption != null) {
                this.currentOption.renderer.dataOperations.clear();
            }
            this.handleDataChange();
        },
        getArray: () => {
            if (this.currentOption != null) {
                return this.currentOption.renderer.dataOperations.getArray();
            }
            return [];
        },
        addAll: (elements: Feature<G, P>[]) => {
            if (this.broadcastData) {
                for (const option of this.options) {
                    option.renderer.dataOperations.addAll(elements);
                }
            } else if (this.currentOption != null) {
                this.currentOption.renderer.dataOperations.addAll(elements);
            }
            this.handleDataChange();
        },
        removeNFirst: (n: number) => {
            let removed: Feature<G, P>[] | null = null;
            if (this.broadcastData) {
                for (const option of this.options) {
                    removed = option.renderer.dataOperations.removeNFirst(n);
                }
            } else if (this.currentOption != null) {
                removed = this.currentOption.renderer.dataOperations.removeNFirst(n);
            }
            this.handleDataChange();
            return removed != null ? removed : [];
        },
        removeNLast: (n: number) => {
            let removed: Feature<G, P>[] | null = null;
            if (this.broadcastData) {
                for (const option of this.options) {
                    removed = option.renderer.dataOperations.removeNLast(n);
                }
            } else if (this.currentOption != null) {
                removed = this.currentOption.renderer.dataOperations.removeNLast(n);
            }
            this.handleDataChange();
            return removed != null ? removed : [];
        }
    };

    setStyle(styleOption: StyleOption<G, P, S>): void {
        for (const option of this.options) {
            option.renderer.setStyle(styleOption);
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

    private handleDataChange() {
        const currentOption = this.currentOption;
        if (currentOption != null && currentOption.condition(currentOption.renderer.dataOperations)) {
            return;
        }
        const newOption = this.options.find(option => option.condition(option.renderer.dataOperations));
        if (newOption === currentOption) {
            return;
        }
        if (this.map != null && this.gl != null) {
            if (currentOption != null) {
                currentOption.renderer.dispose(this.map, this.gl);
            }
            if (newOption != null) {
                newOption.renderer.initialise(this.map, this.gl);
            }
        }
        this.currentOption = newOption != null ? newOption : null;
    }
}
