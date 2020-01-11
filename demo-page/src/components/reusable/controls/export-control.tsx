import React, {Component} from 'react';
import {MapProp, withMap} from '../with-map';
import {MapControlPosition} from './map-control';
import {MapControlDiv} from './map-control-div';
import html2canvas from 'html2canvas';
import icon from './export-icon.svg';

interface ExportControlProps {
    position?: MapControlPosition;
    imageType?: string;
    imageQuality?: number;
    fileName?: string;
    showTopLeftControls?: boolean;
    showTopRightControls?: boolean;
    showBottomLeftControls?: boolean;
    showBottomRightControls?: boolean;
}

interface State {
    isLoading: boolean;
}

class Control extends Component<ExportControlProps & MapProp, State> {
    constructor(props: ExportControlProps & MapProp) {
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
        const showTopLeft = props.showTopLeftControls ? props.showTopLeftControls : false;
        const showTopRight = props.showTopRightControls ? props.showTopRightControls : false;
        const showBottomLeft = props.showBottomLeftControls ? props.showBottomLeftControls : false;
        const showBottomRight = props.showBottomRightControls ? props.showBottomRightControls : false;
        const map = props.map;
        this.setState({isLoading: true});
        map.once('render', () => {
            html2canvas(
                map.getContainer(),
                {
                    ignoreElements: element => {
                        const parent = element.parentElement;
                        if (parent == null || !parent.classList.contains('mapboxgl-control-container')) {
                            return false;
                        }
                        const classList = element.classList;
                        const isTopLeft = classList.contains('mapboxgl-ctrl-top-left');
                        const isTopRight = classList.contains('mapboxgl-ctrl-top-right');
                        const isBottomLeft = classList.contains('mapboxgl-ctrl-bottom-left');
                        const isBottomRight = classList.contains('mapboxgl-ctrl-bottom-right');
                        return !(isTopLeft && showTopLeft) &&
                            !(isTopRight && showTopRight) &&
                            !(isBottomLeft && showBottomLeft) &&
                            !(isBottomRight && showBottomRight);
                    }
                }
            )
                .then(canvas => {
                    const dataUrl = canvas.toDataURL(imageType, imageQuality);
                    const a = document.createElement('a');
                    a.href = dataUrl;
                    a.download = fileName;
                    a.click();
                    this.setState({isLoading: false});
                })
                .catch(() => this.setState({isLoading: false}));
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

export const ExportControl = withMap(Control);
