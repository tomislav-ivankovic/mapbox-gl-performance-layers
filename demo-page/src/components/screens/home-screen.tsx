import React from 'react';
import {Link} from 'react-router-dom';

export function HomeScreen() {
    return (
        <div>
            <h1>Mapbox Custom Layers</h1>
            <nav>
                <ul>
                    <li><Link to="/points">Points</Link></li>
                    <li><Link to="/lines">Lines</Link></li>
                    <li><Link to="/polygons">Polygons</Link></li>
                    <li><Link to="/grid">Grid</Link></li>
                    <li><Link to="/multi-layer">Multi Layer</Link></li>
                </ul>
            </nav>
        </div>
    );
}
