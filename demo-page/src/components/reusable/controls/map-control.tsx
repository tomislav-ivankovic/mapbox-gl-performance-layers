import {Component} from 'react';
import {withMap, MapProp} from '../with-map';
import {Control, IControl} from 'mapbox-gl';

export type MapControlPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface MapControlProps {
    position?: MapControlPosition;
    controlConstructor: () => (Control | IControl);
}

class ControlComponent extends Component<MapControlProps & MapProp, {}> {
    private readonly control = this.props.controlConstructor();

    componentDidMount(): void {
        this.addControl();
    }

    componentWillUnmount(): void {
        this.removeControl();
    }

    componentDidUpdate(prevProps: Readonly<MapControlProps>, prevState: Readonly<{}>, snapshot?: any): void {
        if (this.props.position !== prevProps.position) {
            this.removeControl();
            this.addControl();
        }
    }

    private addControl() {
        this.props.map.addControl(this.control, this.props.position);
    }

    private removeControl() {
        const map = this.props.map;
        if (map.getStyle() != null) {
            map.removeControl(this.control);
        }
    }

    render() {
        return null;
    }
}

export const MapControl = withMap(ControlComponent);
