import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, Link, IndexRoute } from 'react-router';
import App from './App';
//import DevTools from './DevTools';

import NoMatch from '../components/NoMatch';
import Welcome from './Welcome';

import BaseDocIndex from './BaseDocIndex'; // 基础档案列表页面
import ArchContainer from './ArchContainer'; // 基础档案
import RoleContainer from './RoleContainer'; // 角色配置
import PermissionPage from './PermissionPage'; // 权限配置/权限分配
import ArchSettingPage from './ArchSettingPage'; // 基础档案配置
import NCSyncPage from './NCSyncPage'; // NC同步配置功能

// Demo
import DemoFormContainer from './DemoFormContainer';
import DemoTreeContainer from './DemoTreeContainer';

/**
 * Component is exported for conditional usage in Root.js
 */
module.exports = class Root extends Component {
  render() {
    const { store } = this.props;
    return (
      /**
       * Provider is a component provided to us by the 'react-redux' bindings that
       * wraps our app - thus making the Redux store/state available to our 'connect()'
       * calls in component hierarchy below.
       */
      <Provider store={store}>
        <div>
          <Router>
            <Route path="/" component={App}>
              <IndexRoute component={Welcome}/>
              <Route path="/welcome" component={Welcome}></Route>
              <Route path="basedocs" component={BaseDocIndex}>
                <Route path="/basedoc/:baseDocId" component={ArchContainer} />
              </Route>
              <Route path="/role" component={RoleContainer}></Route>
              <Route path="/permission" component={PermissionPage}></Route>
              <Route path="/archsetting" component={ArchSettingPage}></Route>
              <Route path="/ncsync" component={NCSyncPage}></Route>
              <Route path="/demo/form" component={DemoFormContainer}></Route>
              <Route path="/demo/tree" component={DemoTreeContainer}></Route>
              <Route path="*" component={NoMatch} />
            </Route>
          </Router>
          {/* Being the dev version of our Root component, we include DevTools below */}
          {/*<DevTools />*/}
        </div>
      </Provider>
    );
  }
};

