import React, {Component} from 'react';

interface State {
    center: [number, number];
    zoom: [number];
}

export class PolygonsWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            center: [16, 44.5],
            zoom: [6.5]
        };
    }

    render() {
        return <p>Polygons wrapper.</p>;
    }
}
