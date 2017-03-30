/**
 * 【友账表】 会计平台 - 实体映射
 */

import fetch from 'isomorphic-fetch';

// help functions
import * as utils from './utils';
import * as treeUtils from './utils.tree';

// 后端接口URL，比如: LOCAL_EXPRESS_SERVER = '127.0.0.1:3009'
import * as URL from '../constants/URLs';

/**
 * Fetch API credentials 选项
 * - false 不往Fetch API中添加credentials选项
 * - same-origin 在请求中添加Cookie
 */
const FETCH_CREDENTIALS_OPTION = 'same-origin';

/**
 * 是否启用后端的开发用服务器
 * * -1 使用本地的expressjs服务器伪造数据
 * *  0 使用后端开发人员提供的开发机上跑的服务
 * *  1 使用后端提供的测试服务器
 */
const DEV_BACKEND_INDEX = 1;

/**
 * 根据配置获取到实体映射的绝对路径
 * 比如：http://59.110.123.20/ficloud/outerentitytree/querymdtree
 */
function getURL(path) {
  const url = server => `http://${server}${path}`;
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return url(process.env.YZB_PROD_SERVER);
  }
  if (DEV_BACKEND_INDEX === -1) {
    return url(URL.LOCAL_EXPRESS_SERVER);
  }
  return url(URL.ENTITYMAP_DEV_SERVERS[DEV_BACKEND_INDEX]);
}

/**
 * 实体映射模型 exchanger/entitymap.md
 */

// 左树查询服务
// const OUTER_ENTITY_TREE_URL = getURL('/ficloud_web/template/tree');
const OUTER_ENTITY_TREE_URL = getURL('/ficloud/outerentitytree/querymdtree');
// 左树节点查询服务
// const OUTER_ENTITY_TREE_NODE_CHILDREN_URL = getURL('/ficloud_web/template/node');
// 右表查询服务
const OUTER_ENTITY_TREE_NODE_DATA_URL = getURL('/ficloud/outerentitytree/querynodedata');
const OUTER_ENTITY_TREE_ADD_NODE_DATA_URL = getURL('/ficloud/outerentitytree/addnodedata');
const OUTER_ENTITY_TREE_UPDATE_NODE_DATA_URL = getURL('/ficloud/outerentitytree/updatenodedata');
const OUTER_ENTITY_TREE_DEL_NODE_DATA_URL = getURL('/ficloud/outerentitytree/delnodedata');

/** 配置Fetch API的credentials参数 */
function appendCredentials(opts) {
  if (FETCH_CREDENTIALS_OPTION) {
    opts.credentials = FETCH_CREDENTIALS_OPTION;
  }
  return opts;
}

/**
 * 左边的树
 */

export const LEFT_TREE_REQUEST = 'LEFT_TREE_REQUEST';
export const LEFT_TREE_SUCCESS = 'LEFT_TREE_SUCCESS';
export const LEFT_TREE_FAILURE = 'LEFT_TREE_FAILURE';

/**
 * 获取左边的树
 * @param {String} billTypeCode
 * @param {String} mappingDefId
 */
export function fetchLeftTree(billTypeCode, mappingDefId) {
  // use `callAPIMiddleware`
  return {
    types: [LEFT_TREE_REQUEST, LEFT_TREE_SUCCESS, LEFT_TREE_FAILURE],
    // Check the cache (optional):
    // shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      let opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          billtypecode: billTypeCode, // "C0"
          mappingdefid: mappingDefId // "1"
        })
      };
      appendCredentials(opts);

      let url = `${OUTER_ENTITY_TREE_URL}`;

      return fetch(url, opts)
        .then(utils.checkHTTPStatus)
        .then(utils.parseJSON)
        .then(resObj => {
          // 处理success: false
          return resObj;
        });
    }
  };
}

/**
 * 获取左边树上指定节点的子节点，用于节点展开的查询
 */

export const TEMPLATE_NODE_REQUEST = 'TEMPLATE_NODE_REQUEST';
export const TEMPLATE_NODE_SUCCESS = 'TEMPLATE_NODE_SUCCESS';
export const TEMPLATE_NODE_FAILURE = 'TEMPLATE_NODE_FAILURE';

export function fetchLeftTreeNodeChildren(key) {
  // use `callAPIMiddleware`
  return {
    types: [TEMPLATE_NODE_REQUEST, TEMPLATE_NODE_SUCCESS, TEMPLATE_NODE_FAILURE],
    // Check the cache (optional):
    shouldCallAPI: (state) => !treeUtils.hasChildren(state.entityMap.treeData, key),
    callAPI: (state) => {
      var opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          key // 0-1
        })
      };
      appendCredentials(opts);

      var url = `${OUTER_ENTITY_TREE_NODE_CHILDREN_URL}`;

      return fetch(url, opts)
        .then(response => {
          return response.json();
        })
        .then(resObj => {
          // 处理success: false

          // 从store中取得树数据，然后添加节点，再保存回store中
          const treeData = [...state.entityMap.treeData];
          const newTreeData = treeUtils.genNewTreeData(treeData, key, resObj.data/* , 9999 */);

          return {
            treeData: newTreeData
          };
        })
    }
  }
}

/**
 * 从后端获取指定节点的数据，用于填充右侧的表格和表单
 */

export const ENTITY_TREE_NODE_DATA_REQUEST = 'ENTITY_TREE_NODE_DATA_REQUEST';
export const ENTITY_TREE_NODE_DATA_SUCCESS = 'ENTITY_TREE_NODE_DATA_SUCCESS';
export const ENTITY_TREE_NODE_DATA_FAILURE = 'ENTITY_TREE_NODE_DATA_FAILURE';

/**
 * 根据一个节点提供的信息，包括title和key，发送请求获取该节点的数据，用于显示
 * 右侧的表单
 * @param {Object} treeNodeData 节点数据，比如
 * ```json
 * {
 *   "parentKey": null,
 *   "title": "总账凭证:友账簿凭证",
 *   "key": "@E@:G001ZM0000BILLTYPE000000000000000003",
 *   "isLeaf": false,
 *   "infoKey": "1"
 * }
 * ```
 */
export function fetchTreeNodeData(treeNodeData, baseDocId = 'entity') {
  // use `callAPIMiddleware`
  return {
    types: [ENTITY_TREE_NODE_DATA_REQUEST, ENTITY_TREE_NODE_DATA_SUCCESS, ENTITY_TREE_NODE_DATA_FAILURE],
    // Check the cache (optional):
    // shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      const opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(treeNodeData)
      };
      appendCredentials(opts);
      const url = `${OUTER_ENTITY_TREE_NODE_DATA_URL}`;

      return fetch(url, opts)
        .then(utils.checkHTTPStatus)
        .then(utils.parseJSON)
        .then(resObj => {
          if (resObj.success !== true) {
            throw {
              name: 'SUCCESS_FALSE',
              message: resObj.message || '未知错误'
            };
          }

          // 1. 删除不用的字段，按理说应该后端从response中删除掉的
          // 2. 修复后端json中的错别字，暂时在前端写死
          // 3. 后端数据类型使用int，前端使用string，暂时在前端写死
          // 4. 有些字段是必填项，暂时在前端写死
          // 5. 有些字段需要隐藏，暂时在前端写死
          // 6. 有些字段的类型错误，暂时在前端写死新类型
          // 7. 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
          // 8. 添加参照的配置
          let fieldsModel = resObj.data.head
            /* 1 */ .filter(utils.shouldNotRemoveFields.bind(this, baseDocId))
            /* 2 */ .map(utils.fixFieldTypo)
            /* 3 */ .map(utils.convertDataType)
            /* 4 */ .map(utils.setRequiredFields.bind(this, baseDocId))
            /* 5 */ .map(utils.setHiddenFields)
            /* 6 */ .map(utils.fixDataTypes.bind(this, baseDocId))
            /* 7 */ .map(utils.fixReferKey)
            /* 8 */ /* .map(utils.setReferFields.bind(this)) */;

          return {
            fieldsModel,
            tableBodyData: resObj.data.body
          };
        });
    }
  };
}

/**
 * 记录哪个节点被点击了
 */
export const ENTITYMAP_CLICKED_NODE_DATA_UPDATE = 'ENTITYMAP_CLICKED_NODE_DATA_UPDATE';
export const saveClickedNodeData = treeNodeData => dispatch => dispatch({
  type: ENTITYMAP_CLICKED_NODE_DATA_UPDATE,
  treeNodeData
});

export const ENTITY_MAP_EDIT_DIALOG_SHOW = 'ENTITY_MAP_EDIT_DIALOG_SHOW';

/**
 * 显示/隐藏编辑/创建窗口
 * @param {boolean} show 是否显示
 * @param {Number} [rowIdx=null] 编辑行的index
 * @param {Object} [editFormData={}] 编辑行的数据，用于填充表单
 */
export function showEditDialog(show, rowIdx = null, editFormData = {}) {
  return (dispatch) => {
    dispatch({
      type: ENTITY_MAP_EDIT_DIALOG_SHOW,
      show,
      rowIdx,
      editFormData
    });
  };
}

export const ENTITY_MAP_CREATE_DIALOG_SHOW = 'ENTITY_MAP_CREATE_DIALOG_SHOW';

/**
 * @param {Boolean} show 显示/隐藏对话框
 * @param {Object} [formData={}] 需要填充到表单中的数据
 */
export const showCreateDialog = (show, formData = {}) => dispatch => dispatch({
  type: ENTITY_MAP_CREATE_DIALOG_SHOW,
  show,
  formData
});

/**
 * 右侧表格，保存操作，然后关闭对话框
 */

export const TREE_NODE_DATA_UPDATE_REQUEST = 'TREE_NODE_DATA_UPDATE_REQUEST';
export const TREE_NODE_DATA_UPDATE_SUCCESS = 'TREE_NODE_DATA_UPDATE_SUCCESS';
export const TREE_NODE_DATA_UPDATE_FAILURE = 'TREE_NODE_DATA_UPDATE_FAILURE';

/**
 * @param {Object} formData 表单提交的数据
 */
export function updateTreeNodeData(formData) {
  // use `callAPIMiddleware`
  return {
    types: [
      TREE_NODE_DATA_UPDATE_REQUEST,
      TREE_NODE_DATA_UPDATE_SUCCESS,
      TREE_NODE_DATA_UPDATE_FAILURE
    ],
    callAPI: () => {
      let requestBodyObj = { ...formData };
      let opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestBodyObj)
      };
      appendCredentials(opts);

      const url = OUTER_ENTITY_TREE_UPDATE_NODE_DATA_URL;
      return fetch(url, opts)
        .then(utils.checkHTTPStatus)
        .then(utils.parseJSON)
        .then(resObj => {
          if (resObj.success !== true) {
            throw {
              name: 'SUCCESS_FALSE',
              message: resObj.message
            };
          }
        });
    }
  };
}

/**
 * 右侧表格，新建操作
 */

export const TREE_NODE_DATA_ADD_REQUEST = 'TREE_NODE_DATA_ADD_REQUEST';
export const TREE_NODE_DATA_ADD_SUCCESS = 'TREE_NODE_DATA_ADD_SUCCESS';
export const TREE_NODE_DATA_ADD_FAILURE = 'TREE_NODE_DATA_ADD_FAILURE';

/**
 * @param {Object} formData 表单提交的数据
 */
export const addTreeNodeData = formData => ({
  types: [
    TREE_NODE_DATA_ADD_REQUEST,
    TREE_NODE_DATA_ADD_SUCCESS,
    TREE_NODE_DATA_ADD_FAILURE
  ],
  callAPI: () => {
    let opts = {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({...formData})
    };
    appendCredentials(opts);

    const url = OUTER_ENTITY_TREE_ADD_NODE_DATA_URL;
    return fetch(url, opts)
      .then(utils.checkHTTPStatus)
      .then(utils.parseJSON)
      .then(resObj => {
        if (resObj.success !== true) {
          throw {
            name: 'SUCCESS_FALSE',
            message: resObj.message
          };
        }
      });
  }
});

/**
 * 右侧表格，删除操作
 */

export const TREE_NODE_DATA_DEL_REQUEST = 'TREE_NODE_DATA_DEL_REQUEST';
export const TREE_NODE_DATA_DEL_SUCCESS = 'TREE_NODE_DATA_DEL_SUCCESS';
export const TREE_NODE_DATA_DEL_FAILURE = 'TREE_NODE_DATA_DEL_FAILURE';

/**
 * @param {Object} rowObj
 */
export function delTreeNodeData(rowObj) {
  // use `callAPIMiddleware`
  return {
    types: [
      TREE_NODE_DATA_DEL_REQUEST,
      TREE_NODE_DATA_DEL_SUCCESS,
      TREE_NODE_DATA_DEL_FAILURE
    ],
    callAPI: () => {
      const { id } = rowObj;
      let opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({ id })
      };
      appendCredentials(opts);

      const url = OUTER_ENTITY_TREE_DEL_NODE_DATA_URL;
      return fetch(url, opts)
        .then(utils.checkHTTPStatus)
        .then(utils.parseJSON)
        .then(resObj => {
          if (resObj.success !== true) {
            throw {
              name: 'SUCCESS_FALSE',
              message: resObj.message
            };
          }
        })
    }
  }
}

/**
 * 错误提示
 */

export const PAGE_ALERT_SHOW = 'PAGE_ALERT_SHOW';
export const FORM_ALERT_SHOW = 'FORM_ALERT_SHOW';

export function showPageAlert(show, message) {
  return (dispatch) => {
    dispatch({
      type: PAGE_ALERT_SHOW,
      show,
      message
    });
  };
}

export const showFormAlert = (show, message) => dispatch => dispatch({
  type: FORM_ALERT_SHOW,
  show,
  message
});

/**
 * 复合操作：获取节点数据（用于填充右侧表格）并记录选中的节点
 */
export const fetchTreeNodeDataAndSaveClickedNodeData = treeNodeData => dispatch => {
  return dispatch(fetchTreeNodeData(treeNodeData))
    .then(() => dispatch(saveClickedNodeData(treeNodeData)));
};

/**
 * 复合操作：创建并刷新表格
 */
export const addTreeNodeDataAndFetchTreeNodeData = formData => (dispatch, getState) => {
  const { entityMap } = getState();
  return dispatch(addTreeNodeData(formData))
    .then(() => dispatch(fetchTreeNodeData(entityMap.clickedTreeNodeData)))
    .then(() => dispatch(showCreateDialog(false)));
};

/**
 * 复合操作：更新并刷新表格
 */
export const updateTreeNodeDataAndFetchTreeNodeData = (formData) => (dispatch, getState) => {
  const { entityMap } = getState();
  return dispatch(updateTreeNodeData(formData))
    .then(() => dispatch(fetchTreeNodeData(entityMap.clickedTreeNodeData)))
    .then(() => dispatch(showEditDialog(false)));
};

/**
 * 复合操作：删除并刷新表格
 */
export const delTreeNodeDataAndFetchTreeNodeData = rowIdx => (dispatch, getState) => {
  const { entityMap } = getState();
  return dispatch(delTreeNodeData(rowIdx))
    .then(() => dispatch(fetchTreeNodeData(entityMap.clickedTreeNodeData)));
};
