import React, {Component} from 'react';

interface State {
    center: [number, number];
    zoom: [number];
}

export class LinesWrapper extends Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            center: [16, 44.5],
            zoom: [6.5]
        };
    }

    render() {
        return <p>Lines wrapper.</p>;
    }
}
