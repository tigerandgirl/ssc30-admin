import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as WelcomeActions from '../actions/welcome';

import { Link } from 'react-router';
import { Button, ButtonToolbar } from 'react-bootstrap';
import NormalWidget from './../components/NormalWidget';

class Welcome extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  render() {
    return (
      <div className="welcomeContainer">
        <NormalWidget />
        <div>
          <h2>基础档案</h2>
          <ul>
            <li>
              <Link to={`/basedocs`}>
                所有基础档案类型
              </Link>
            </li>
            <li>
              <Link to={`/basedocs-no-sidebar`}>
                所有基础档案类型(no-sidebar)
              </Link>
            </li>
            <li>
              <Link to={`/basedocs-no-sidebar-single-page/basedoc/dept`}>
                基础档案 - 部门(no-sidebar, single-page)
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>会计平台</h2>
          <ul>
            <li>
              <Link to={`/external-data-modelling-no-sidebar-single-page`}>
                外部数据建模 ExternalDataModelling (no-sidebar, single-page)
              </Link>
            </li>
            <li>
              <Link to={`/entity-no-sidebar-single-page`}>
                实体模型 Entity (no-sidebar, single-page)
              </Link>
            </li>
            <li>
              <Link to={`/template-no-sidebar-single-page`}>
                实体映射 Template （模板）(no-sidebar, single-page)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
};

//影射Store的State到App的Props, 这里用做数据
function mapStateToProps(state) {
    return state.welcome;
}

//影射Store的dispath到App的Props,这里用做操作(事件)
function mapDispatchToProps(dispatch) {
    return bindActionCreators(WelcomeActions, dispatch);
}

//练接是中间组件react-redux功能,用于把React的Props, State, Event和Redux的关联
export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
