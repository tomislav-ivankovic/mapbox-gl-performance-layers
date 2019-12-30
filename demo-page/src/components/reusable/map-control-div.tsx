import React, {Component, ReactNode, Fragment, CSSProperties} from 'react';
import ReactDOM from 'react-dom';
import {mapComponent} from 'react-mapbox-gl-performance-layers';
import {IControl} from 'mapbox-gl';

export interface MapControlDivProps {
    map: mapboxgl.Map;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class MapControl extends Component<MapControlDivProps, {}> {
    private readonly div: HTMLDivElement;
    private readonly control: IControl = {
        onAdd: () => this.div,
        onRemove: () => {
            const parent = this.div.parentNode;
            if (parent != null) {
                parent.removeChild(this.div);
            }
        }
    };

    constructor(props: MapControlDivProps) {
        super(props);
        this.div = document.createElement('div');
        this.updateClassName();
        this.updateStyle();
        this.updateContent();
    }

    componentDidMount(): void {
        this.addControl();
    }

    componentWillUnmount(): void {
        this.removeControl();
    }

    componentDidUpdate(prevProps: Readonly<MapControlDivProps>): void {
        if (this.props.children !== prevProps.children) {
            this.updateContent();
        }
        if (this.props.position !== prevProps.position) {
            this.removeControl();
            this.addControl();
        }
        if (this.props.className !== prevProps.className) {
            this.updateClassName();
        }
        if (this.props.style !== prevProps.style) {
            this.updateStyle();
        }
    }

    private addControl() {
        this.props.map.addControl(this.control, this.props.position);
    }

    private removeControl() {
        this.props.map.removeControl(this.control);
    }

    private updateClassName() {
        this.div.className = this.props.className != null ? this.props.className : '';
    }

    private updateStyle() {
        this.div.style.cssText = '';
        if (this.props.style == null) {
            return;
        }
        Object.entries(this.props.style).forEach(([key, value]) => {
            this.div.style[key as any] = value;
        });
    }

    private updateContent() {
        ReactDOM.render(<Fragment>{this.props.children}</Fragment>, this.div);
    }

    render() {
        return null;
    }
}

export const MapControlDiv = mapComponent(MapControl);
