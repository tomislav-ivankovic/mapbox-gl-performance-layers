import React, {Component} from 'react';
import {Switch, Route} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';
import {HomeScreen} from './screens/home-screen';
import {PointsScreen} from './screens/points-screen';
import {LinesScreen} from './screens/lines-screen';
import {PolygonsScreen} from './screens/polygons-screen';
import {GridScreen} from './screens/grid-screen';

export class Main extends Component<{}, {}> {
    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path={'/points'} component={PointsScreen}/>
                    <Route exact path={'/lines'} component={LinesScreen}/>
                    <Route exact path={'/polygons'} component={PolygonsScreen}/>
                    <Route exact path={'/grid'} component={GridScreen}/>
                    <Route component={HomeScreen}/>
                </Switch>
            </Router>
        );
    }
}
