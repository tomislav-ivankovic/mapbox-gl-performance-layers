import {MapControlDiv} from './map-control-div';
import React, {Component} from 'react';
import {mapComponent, MapComponentProps} from 'react-mapbox-gl-performance-layers';

interface State {
    isLoading: boolean;
}

class Control extends Component<MapComponentProps, State>{
    constructor(props: MapComponentProps) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    handleClick = () => {
        const map = this.props.map;
        this.setState({isLoading: true});
        map.once('render', () => {
            const dataUrl = map.getCanvas().toDataURL('image/png', 1.0);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'export.png';
            document.body.appendChild(a);
            a.click();
            this.setState({isLoading: false});
        });
        map.triggerRepaint();
    };

    render() {
        const state = this.state;
        return (
            <MapControlDiv position={'top-left'} style={{pointerEvents: 'auto'}}>
                <button disabled={state.isLoading} onClick={this.handleClick}>Export</button>
            </MapControlDiv>
        );
    }
}

export const ExportControl = mapComponent(Control);
