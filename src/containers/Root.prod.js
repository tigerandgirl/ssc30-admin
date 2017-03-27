import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, Link, IndexRoute } from 'react-router';
import App from './App';

import NoMatch from '../components/NoMatch';
import Welcome from './Welcome';

import ArchContainer from './ArchContainer'; // 基础档案
import AccountingSubject from './AccountingSubject'; // 会计平台科目
import BaseDocIndex from './BaseDocIndex'; // 基础档案列表页面
import AccSubIndex from './AccSubIndex'; // 会计平台列表页面
import MappingDef from './MappingDef'; // 转换规则定义
import ExternalDataModelling from './ExternalDataModelling'; // 外部数据建模
import Entity from './Entity'; // 实体模型
import EntityMap from './EntityMap'; // 实体映射

/** 2016年做的，不知道以后是否还有用 */
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
            <Route path="/" component={Welcome}>
            </Route>
            <Route path="/app" component={App}>
              <IndexRoute component={Welcome}/>
              <Route path="/welcome" component={Welcome}></Route>
              <Route path="/basedocs" component={BaseDocIndex}>
                <Route path="/basedoc/:baseDocId" component={ArchContainer} />
              </Route>
              <Route path="/accsubs" component={AccSubIndex}>
                <Route path="/accsub/:baseDocId" component={AccountingSubject} />
              </Route>
              <Route path="/role" component={RoleContainer}></Route>
              <Route path="/permission" component={PermissionPage}></Route>
              <Route path="/archsetting" component={ArchSettingPage}></Route>
              <Route path="/ncsync" component={NCSyncPage}></Route>
              <Route path="/demo/form" component={DemoFormContainer}></Route>
              <Route path="/demo/tree" component={DemoTreeContainer}></Route>
              <Route path="*" component={NoMatch} />
            </Route>
            <Route path="/basedocs-no-sidebar" component={BaseDocIndex}>
              <Route path="/basedocs-no-sidebar/basedoc/:baseDocId" component={ArchContainer} />
            </Route>
            <Route path="/accsubs-no-sidebar" component={AccSubIndex}>
              <Route path="/accsubs-no-sidebar/accsub/:baseDocId" component={AccountingSubject} />
            </Route>
            <Route path="/basedocs-no-sidebar-single-page/basedoc/:baseDocId" component={ArchContainer} />
            <Route path="/external-data-modelling-no-sidebar-single-page/:billTypeCode" component={ExternalDataModelling} />
            <Route path="/entity-no-sidebar-single-page" component={Entity} />
            <Route
              path="/entity-map-no-sidebar-single-page/:billTypeCode/:mappingDefId"
              component={EntityMap}
            />
            <Route
              path="/mapping-def-no-sidebar-single-page"
              component={MappingDef}
            />
          </Router>
        </div>
      </Provider>
    );
  }
};
