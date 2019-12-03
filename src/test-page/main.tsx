import React, {Component, Fragment} from 'react';
import {Switch, Route} from 'react-router';
import {BrowserRouter as Router} from 'react-router-dom';
import {HomeScreen} from './screens/home-screen';
import {PointsScreen} from './screens/points-screen';
import {LinesScreen} from './screens/lines-screen';
import {PolygonsScreen} from './screens/polygons-screen';
import testImage from './test.png';

export class Main extends Component<{}, {}> {
    render() {
        return (
            <Fragment>
                <Router>
                    <Switch>
                        <Route exact path={'/points'} component={PointsScreen}/>
                        <Route exact path={'/lines'} component={LinesScreen}/>
                        <Route exact path={'/polygons'} component={PolygonsScreen}/>
                        <Route component={HomeScreen}/>
                    </Switch>
                </Router>
                <img id={'test-image'} src={testImage} width={0} height={0} alt={'Test.'}/>
            </Fragment>
        );
    }
}
