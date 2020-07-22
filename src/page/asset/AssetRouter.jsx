import React from 'react';
import { HashRouter as Router, Switch, Redirect, Route, Link } from 'react-router-dom'
// 页面

import AssetMapGaoDe from './AssetMapGaoDe.jsx';



export default class AssetRouter extends React.Component {
    render() {
        return (
            <Switch>
                <Route path="/Asset/AssetMapGaoDe" component={AssetMapGaoDe} />
            </Switch>
        )
    }
}