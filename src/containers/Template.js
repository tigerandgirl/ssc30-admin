import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import { Grid, Row, Col, Button, Modal } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import Tree, { TreeNode } from 'rc-tree';

import { Grid as SSCGrid, Form as SSCForm, Tree as SSCTree } from 'ssc-grid';

import NormalWidget from '../components/NormalWidget';
import AdminEditDialog from '../components/AdminEditDialog';
import AdminAlert from '../components/AdminAlert';

import * as Actions from '../actions/template';

const DEFAULT_EXPANDED_LEVEL = 3;

/**
 * 需求是让默认展开三层结构
 * 需要在数组中列出所有需要展开的node的key
 * @param {Array} treeData 根据数据展开前三层节点
 * @return {Array} 需要展开的node的key
 */
function getDefaultExpandedKeys([...treeData]) {
  var expandedKeys = [];
  var level = 1;
  const loop = nodes => {
    nodes.forEach(node => {
      if (level === DEFAULT_EXPANDED_LEVEL) {
        return;
      } else {
        expandedKeys.push(node.key);
        if (node.children) {
          level++;
          loop(node.children);
          level--;
        }
      }
    });
  }
  loop(treeData);
  return expandedKeys;
}

/**
 * 【友账表】 会计平台 - 实体映射
 * UI：左树右卡
 * API文档：
 * 1. 左树：
 * 1. 右卡：http://git.yonyou.com/sscplatform/fc_doc/blob/master/exchanger/entitytreenode.md
 */

class Template extends Component {
  static propTypes = {
    /**
     * [store] 左侧树的数据
     */
    treeData: PropTypes.array.isRequired
  }

  state = {
    activePage: 1,
    startIndex: 0,
    checkedKeys: []
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.props.fetchEntityFieldsModel();
    this.props.fetchTemplateTree('2643');
  }

  componentWillReceiveProps(nextProps) {
  }

  /**
   * @param {Array} selectedKeys
   * @param {Object} e {selected: bool, selectedNodes, node, event}
   */
  onSelect(selectedKeys, e) {
    // console.log('selected', selectedKeys);
    console.log(e.node.props.eventKey);
  }

  onCheck(checkedKeys) {
    console.log(checkedKeys);
    this.setState({
      checkedKeys,
    });
  }

  onLoadData(treeNode) {
    // TODO 因为使用了callAPIMiddleware导致如下调用返回的结果可能是Promise也可能
    // 是undefined
    const promise = this.props.fetchTemplateTreeNode(treeNode.props.eventKey);
    if (promise) {
      return promise;
    } else {
      return new Promise((resolve, reject) => {
        return resolve();
      });
    }
  }

  render() {
    const { columnsModel, templateTree } = this.props;

    let level = 0;
    const loop = (data) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key}>
              {loop(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode title={item.title} key={item.key} isLeaf={item.isLeaf}/>
        );
      });
    };

    const treeNodes = loop(this.props.treeData);
    const defaultExpandedKeys = getDefaultExpandedKeys(this.props.treeData);

    return (
      <div className="template-container">
        <Grid>
          <Row>
            <Col md={4}>
              {this.props.treeData.length !== 0
                ? <Tree
                    onSelect={::this.onSelect}
                    checkable
                    onCheck={::this.onCheck}
                    checkedKeys={this.state.checkedKeys}
                    defaultExpandedKeys={defaultExpandedKeys}
                    loadData={::this.onLoadData}
                  >
                    {treeNodes}
                  </Tree>
                : null
              }
            </Col>
            <Col md={8}>
              <h3>属性编辑器</h3>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {...state.template};
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
}

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(Template);
