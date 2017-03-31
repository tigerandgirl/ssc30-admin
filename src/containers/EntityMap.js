import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { Grid, Row, Col, Button } from 'react-bootstrap';
import Tree, { TreeNode } from 'rc-tree';

import EntityMapTable from './EntityMapTable';

import * as Actions from '../actions/entityMap';

const DEFAULT_EXPANDED_LEVEL = 2;

/**
 * 需求是让默认展开三层结构
 * 需要在数组中列出所有需要展开的node的key
 * @param {Array} treeData 根据数据展开前三层节点
 * @return {Array} 需要展开的node的key
 */
function getDefaultExpandedKeys([...treeData]) {
  let expandedKeys = [];
  let level = 1;
  const loop = nodes => {
    nodes.forEach(node => {
      if (level === DEFAULT_EXPANDED_LEVEL) {
        return;
      }

      expandedKeys.push(node.key);
      if (node.children) {
        level++;
        loop(node.children);
        level--;
      }
    });
  };
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

class EntityMap extends Component {
  static displayName = 'EntityMap'
  static propTypes = {
    entityTableBodyData: PropTypes.array.isRequired,
    fetchLeftTree: PropTypes.func.isRequired,
    fetchLeftTreeNodeChildren: PropTypes.func.isRequired,
    fetchTreeNodeDataAndSaveClickedNodeData: PropTypes.func.isRequired,
    /**
     * URL传参
     * ```js
     * {
     *   billTypeCode,
     *   mappingDefId
     * }
     * ```
     */
    params: PropTypes.object.isRequired,
    clickedTreeNodeData: PropTypes.object.isRequired,
    saveClickedNodeData: PropTypes.func.isRequired,
    showCreateDialog: PropTypes.func.isRequired,
    /**
     * [store] 左侧树的数据
     */
    treeData: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      startIndex: 0,
      checkedKeys: [],
      billTypeCode: this.props.params.billTypeCode,
      mappingDefId: this.props.params.mappingDefId
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    const { billTypeCode, mappingDefId } = this.state;
    // this.props.fetchEntityFieldsModel();
    this.props.fetchLeftTree(billTypeCode, mappingDefId);
    document.title = '实体映射';
  }

  componentWillReceiveProps(/* nextProps */) {
  }

  // 点击“创建”按钮
  handleCreate(/* event */) {
    const { entityTableBodyData } = this.props;
    const rowData = entityTableBodyData[0];
    this.props.showCreateDialog(true, rowData);
    // event.preventDefault();
  }

  /**
   * @param {Array} selectedKeys 所有选中的节点的key属性
   * @param {Object} e {selected: bool, selectedNodes, node, event}
   */
  onSelect(selectedKeys, e) {
    let currentNodeKey = e.node.props.treeNodeData.key;
    let lastNodeKey = this.props.clickedTreeNodeData.key;
    if (currentNodeKey !== lastNodeKey) {
      this.props.fetchTreeNodeDataAndSaveClickedNodeData(e.node.props.treeNodeData);
    } else {
      this.props.saveClickedNodeData(e.node.props.treeNodeData);
    }
  }

  onCheck(checkedKeys) {
    // console.log(checkedKeys);
    this.setState({
      checkedKeys,
    });
  }

  /**
   * 用户点击节点左侧加号打开节点的时候
   */
  onLoadData(treeNode) {
    const emptyPromise = new Promise((resolve/* , reject */) => {
      return resolve();
    });

    const ENABLE_LAZY_LOAD = 0;
    if (!ENABLE_LAZY_LOAD) {
      return emptyPromise;
    }

    // TODO 因为使用了callAPIMiddleware导致如下调用返回的结果可能是Promise也可能
    // 是undefined
    const promise = this.props.fetchLeftTreeNodeChildren(treeNode.props.eventKey);
    if (promise) {
      return promise;
    }
    return emptyPromise;
  }

  render() {
    const loop = (data) => {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode title={item.title} key={item.key}
              treeNodeData={item}
            >
              {loop(item.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode title={item.title} key={item.key} isLeaf={item.isLeaf}
            treeNodeData={item}
          />
        );
      });
    };

    const treeNodes = loop(this.props.treeData);
    const defaultExpandedKeys = getDefaultExpandedKeys(this.props.treeData);

    return (
        
        <div>
            <div className="head">
                <button className="btn btn-default" onClick={::this.handleCreate}>新增</button>
            </div>
            <div className="ledger-content clearfix">
                <div className="ledger-content-left">
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
                </div>
                <div className="ledger-content-right">
                    <EntityMapTable />
                </div>
            </div>
        </div>

    );
  }
}

/**
 * @param {Object} state
 * @param {Object} ownProps
 */
const mapStateToProps = (state) => {
  return {...state.entityMap};
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(Actions, dispatch);
};

// The component will subscribe to Redux store updates.
export default connect(mapStateToProps, mapDispatchToProps)(EntityMap);
