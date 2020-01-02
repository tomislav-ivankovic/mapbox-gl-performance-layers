import React, {Component, ReactNode, Fragment, CSSProperties} from 'react';
import ReactDOM from 'react-dom';
import {IControl} from 'mapbox-gl';
import {MapControl, MapControlPosition} from './map-control';

export interface MapControlDivProps {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    position?: MapControlPosition;
}

export class MapControlDiv extends Component<MapControlDivProps, {}> {
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

    componentDidUpdate(prevProps: Readonly<MapControlDivProps>): void {
        if (this.props.children !== prevProps.children) {
            this.updateContent();
        }
        if (this.props.className !== prevProps.className) {
            this.updateClassName();
        }
        if (this.props.style !== prevProps.style) {
            this.updateStyle();
        }
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
        return (
            <MapControl
                position={this.props.position}
                controlConstructor={() => this.control}
            />
        );
    }
}
