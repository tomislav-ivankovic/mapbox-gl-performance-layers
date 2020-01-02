import React, {Component} from 'react';
import {mapComponent, MapComponentProps} from '../map-component';
import {MapControlPosition} from './map-control';
import {MapControlDiv} from './map-control-div';
import icon from './export-icon.svg';

interface ExportControlProps extends MapComponentProps {
    position?: MapControlPosition;
    imageType?: string;
    imageQuality?: number;
    fileName?: string;
}

interface State {
    isLoading: boolean;
}

class Control extends Component<ExportControlProps, State>{
    constructor(props: MapComponentProps) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    handleClick = () => {
        const props = this.props;
        const imageType = props.imageType != null ? props.imageType : 'image/png';
        const imageQuality = props.imageQuality != null ? props.imageQuality : 1.0;
        const fileName = props.fileName != null ? props.fileName : 'export.png';
        const map = props.map;

        this.setState({isLoading: true});
        map.once('render', () => {
            const dataUrl = map.getCanvas().toDataURL(imageType, imageQuality);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = fileName;
            a.click();
            this.setState({isLoading: false});
        });
        map.triggerRepaint();
    };

    render() {
        const state = this.state;
        const props = this.props;
        return (
            <MapControlDiv
                position={props.position}
                className={'mapboxgl-ctrl mapboxgl-ctrl-group'}
                style={{pointerEvents: 'auto'}}
            >
                <button
                    disabled={state.isLoading}
                    onClick={this.handleClick}
                    className={'mapboxgl-ctrl-group'}
                >
                    <span
                        className={'mapboxgl-ctrl-icon'}
                        style={{backgroundImage: `url(${icon})`}}
                        aria-hidden
                    />
                </button>
            </MapControlDiv>
        );
    }
}

export const ExportControl = mapComponent(Control);
