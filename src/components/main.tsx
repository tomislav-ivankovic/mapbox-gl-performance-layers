import React, {Component} from 'react';
import {Switch, Route} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';
import {Home} from './home';
import {PointsWrapper} from './wrappers/points-wrapper';
import {LinesWrapper} from './wrappers/lines-wrapper';
import {PolygonsWrapper} from './wrappers/polygons-wrapper';

export class Main extends Component<{}, {}> {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path={'/points'} component={PointsWrapper}/>
                    <Route exact path={'/lines'} component={LinesWrapper}/>
                    <Route exact path={'/polygons'} component={PolygonsWrapper}/>
                    <Route component={Home}/>
                </Switch>
            </Router>
        );
    }
}
