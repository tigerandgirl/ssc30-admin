/**
 * 【友账表】 会计平台 - 实体映射
 */

import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import { createAction } from 'redux-actions';

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
 * - 0 使用本地的expressjs服务器伪造数据
 * - 1 使用后端提供的测试服务器
 */
const ENABLE_DEV_BACKEND = 0;

/**
 * 根据配置获取到基础档案的绝对路径
 * 比如：http://127.0.0.1:3009/dept/query
 */
function getBaseDocURL(path) {
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return 'http://' + URL.PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.BASEDOC_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

/**
 * 根据配置获取到参照的绝对路径
 * 比如：http://127.0.0.1:3009/userCenter/queryUserAndDeptByDeptPk
 */
function getReferURL(path) {
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return 'http://' + URL.PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.REFER_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

/**
 * 根据配置获取到实体映射的绝对路径
 * 比如：http://59.110.123.20/ficloud/outerentitytree/querymdtree
 */
function getURL(path) {
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return 'http://' + URL.PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.TEMPLATE_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

// 基础档案 组装后端接口
const FICLOUDPUB_INITGRID_URL = getBaseDocURL('/ficloud_pub/initgrid');

/**
 * 实体映射模型 exchanger/entitymap.md
 */

// 左树查询服务
//const OUTER_ENTITY_TREE_URL = getURL('/ficloud_web/template/tree');
const OUTER_ENTITY_TREE_URL = getURL('/ficloud/outerentitytree/querymdtree');
// 左树节点查询服务
//const OUTER_ENTITY_TREE_NODE_CHILDREN_URL = getURL('/ficloud_web/template/node');
// 右表查询服务
const OUTER_ENTITY_TREE_NODE_DATA_URL = getURL('/ficloud_web/outerentitytree/querynodedata');

// 参照 组装后端接口
const ReferDataURL = getReferURL('/refbase_ctr/queryRefJSON');
const ReferUserDataURL = getReferURL('/userCenter/queryUserAndDeptByDeptPk');

/** 配置Fetch API的credentials参数 */
function appendCredentials(opts) {
  if (FETCH_CREDENTIALS_OPTION) {
    opts.credentials = FETCH_CREDENTIALS_OPTION;
  }
  return opts;
}

// 获取模板树数据

export const TEMPLATE_REQUEST = 'TEMPLATE_REQUEST';
export const TEMPLATE_SUCCESS = 'TEMPLATE_SUCCESS';
export const TEMPLATE_FAILURE = 'TEMPLATE_FAILURE';

/**
 * 获取左边的树
 * @param {String} billTypeCode
 * @param {String} mappingDefId
 */
export function fetchLeftTree(billTypeCode, mappingDefId) {
  // use `callAPIMiddleware`
  return {
    types: [TEMPLATE_REQUEST, TEMPLATE_SUCCESS, TEMPLATE_FAILURE],
    // Check the cache (optional):
    //shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      var opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: "cors",
        body: JSON.stringify({
          billtypecode: billTypeCode, // "C0"
          mappingdefid: mappingDefId // "1"
        })
      };
      appendCredentials(opts);

      var url = `${OUTER_ENTITY_TREE_URL}`;

      return fetch(url, opts)
        .then(response => {
          return response.json();
        })
        .then(resObj => {
          // 处理success: false
          return resObj;
        })
    }
  }
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
        mode: "cors",
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
 * 获取指定节点的数据，用于填充右侧的表格和表单
 */

export const ENTITY_FIELDS_MODEL_REQUEST = 'ENTITY_FIELDS_MODEL_REQUEST';
export const ENTITY_FIELDS_MODEL_SUCCESS = 'ENTITY_FIELDS_MODEL_SUCCESS';
export const ENTITY_FIELDS_MODEL_FAILURE = 'ENTITY_FIELDS_MODEL_FAILURE';

// 获取表格列模型失败
// message: 错误信息
// details: 比如HTTP response body，或者其他为了踢皮球而写的比较啰嗦的文字
function receiveTableColumnsModelFail(message, details) {
  return {
    type: types.LOAD_TABLECOLUMNS_FAIL,
    message, details
  }
}

/**
 * 根据一个节点提供的信息，包括title和key，发送请求获取该节点的数据，用于显示
 * 右侧的表单
 * @param {Object} nodeData 节点数据，比如
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
export function fetchTreeNodeData(nodeData, baseDocId = 'entity') {
  // use `callAPIMiddleware`
  return {
    types: [ENTITY_FIELDS_MODEL_REQUEST, ENTITY_FIELDS_MODEL_SUCCESS, ENTITY_FIELDS_MODEL_FAILURE],
    // Check the cache (optional):
    //shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      const opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: "cors",
        body: JSON.stringify(nodeData)
      };
      appendCredentials(opts);
      const url = `${OUTER_ENTITY_TREE_NODE_DATA_URL}`;

      return fetch(url, opts)
        .then(response => {
          // TODO: HTTP状态检查，需要独立成helper function
          if (response.status >= 200 && response.status < 300) {
            return response;
          } else {
            var error = new Error(response.statusText);
            error.response = response;
            response.text().then(text => {
              return receiveTableColumnsModelFail('后端返回的HTTP status code不是200', text);
            });
            throw error;
          }
        })
        .then(response => {
          return response.json();
        })
        .then(json => {
          if (json.success === true) {

            // // 对字段模型进行业务层的数据校验
            // const [isValid, validationMessage] = utils.validation.tableColumnsModelData(json);
            // if (isValid) {
                // 1. 删除不用的字段，按理说应该后端从response中删除掉的
                // 2. 修复后端json中的错别字，暂时在前端写死
                // 3. 后端数据类型使用int，前端使用string，暂时在前端写死
                // 4. 有些字段是必填项，暂时在前端写死
                // 5. 有些字段需要隐藏，暂时在前端写死
                // 6. 有些字段的类型错误，暂时在前端写死新类型
                // 7. 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
                // 8. 添加参照的配置
                let fieldsModel = json.data.head
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
                  tableBodyData: json.data.body
                };
            // } else {
            //   return receiveTableColumnsModelFail(
            //     `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
            //     但是数据校验方法提示说：“${validationMessage}”`,
            //     JSON.stringify(json.data, null, '  ')
            //   );
            // }

          } else {
            return receiveTableColumnsModelFail(
              '后端返回的success不是true', JSON.stringify(json, null, '  ')
            );
          }
        })
        .catch(function (err) {
          console.log("获取表格列模型失败，错误信息：", err);
        });
    }
  }
}

export const ENTITY_MAP_EDIT_DIALOG_SHOW = 'ENTITY_MAP_EDIT_DIALOG_SHOW';

/**
 * 显示/隐藏编辑/创建窗口
 * @param {boolean} show 是否显示
 * @param {Number} rowIdx 编辑行的index
 * @param {Object} editFormData 编辑行的数据，用于填充表单
 */
export function showEditDialog(show, rowIdx, editFormData) {
  return (dispatch, getState) => {
    dispatch({
      type: ENTITY_MAP_EDIT_DIALOG_SHOW,
      show,
      rowIdx,
      editFormData
    });
  };
}
