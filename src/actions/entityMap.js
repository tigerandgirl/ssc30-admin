/**
 * 【友账表】 会计平台 - 实体映射
 */

import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import { createAction } from 'redux-actions';

// help functions
import * as utils from './utils';

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

// 实体映射模型 exchanger/entitymap.md
//const OUTER_ENTITY_TREE_URL = getURL('/ficloud_web/template/tree');
const OUTER_ENTITY_TREE_URL = getURL('/ficloud_web/outerentitytree/querymdtree');
//const OUTER_ENTITY_TREE_NODE_URL = getURL('/ficloud_web/template/node');
const OUTER_ENTITY_TREE_NODE_URL = getURL('/ficloud_web/outerentitytree/querynodedata');

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

/**
 * 2) A clever exploit of the JSON library to deep-clone objects
 * http://heyjavascript.com/4-creative-ways-to-clone-objects/#
 */
const deepCopy = old => JSON.parse(JSON.stringify(old));

// 获取模板树数据

export const TEMPLATE_REQUEST = 'TEMPLATE_REQUEST';
export const TEMPLATE_SUCCESS = 'TEMPLATE_SUCCESS';
export const TEMPLATE_FAILURE = 'TEMPLATE_FAILURE';

/**
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
 * 更新树
 */

/**
 * 遍历tree然后对没有child的节点设定为叶子节点
 * @param {Array} treeData 当前树的数据
 * @param {String} curKey 在该节点下添加了新的child
 * @param {Number} level 树
 */
function setLeaf(treeData, curKey, level) {
  const loopLeaf = (data, lev) => {
    const l = lev - 1;
    data.forEach((item) => {
      if ((item.key.length > curKey.length) ? item.key.indexOf(curKey) !== 0 :
        curKey.indexOf(item.key) !== 0) {
        return;
      }
      if (item.children) {
        loopLeaf(item.children, l);
      } else if (l < 1) {
        item.isLeaf = true;
      }
    });
  };
  loopLeaf(treeData, level + 1);
}

/**
 * 基于现有的tree，在指定node添加child，创建出来新的tree
 * @param {Array} oldTreeData 没有插入新节点的树
 * @param {String} curKey 将数据添加到这个节点上
 * @param {Array} child 将这个数据添加到指定节点上
 * @param {Number} level 添加的级别，已废弃
 * @return {Array} 插入新节点之后生成的新树
 */
function genNewTreeData(oldTreeData, curKey, child/* , level */) {
  var newTreeData = deepCopy(oldTreeData);
  const loop = (data) => {
    // if (level < 1 || curKey.length - 3 > level * 2) return;
    data.forEach((item) => {
      if (curKey === item.key) {
        item.children = child;
      } else {
        if (item.children) {
          loop(item.children);
        }
      }
    });
  };
  loop(newTreeData);
  //setLeaf(oldTreeData, curKey, level);
  return newTreeData;
}

/**
 * 获取模板树上指定节点的子节点
 */

export const TEMPLATE_NODE_REQUEST = 'TEMPLATE_NODE_REQUEST';
export const TEMPLATE_NODE_SUCCESS = 'TEMPLATE_NODE_SUCCESS';
export const TEMPLATE_NODE_FAILURE = 'TEMPLATE_NODE_FAILURE';

/**
 * 树中是否有指定名称的节点是否还有子节点
 */
function hasChildren(state, key) {
  var has = false;
  const loop = nodes => {
    nodes.forEach(node => {
      if (node.key === key && node.children) {
        has = true;
        return;
      }
      if (node.children) {
        loop(node.children);
      }
    });
  };
  loop(state.entityMap.treeData);
  return has;
}

export function fetchLeftTreeNode(key) {
  // use `callAPIMiddleware`
  return {
    types: [TEMPLATE_NODE_REQUEST, TEMPLATE_NODE_SUCCESS, TEMPLATE_NODE_FAILURE],
    // Check the cache (optional):
    shouldCallAPI: (state) => !hasChildren(state, key),
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

      var url = `${OUTER_ENTITY_TREE_NODE_URL}`;

      return fetch(url, opts)
        .then(response => {
          return response.json();
        })
        .then(resObj => {
          // 处理success: false

          // 从store中取得树数据，然后添加节点，再保存回store中
          const treeData = [...state.entityMap.treeData];
          const newTreeData = genNewTreeData(treeData, key, resObj.data/* , 9999 */);

          return {
            treeData: newTreeData
          };
        })
    }
  }
}

/**
 * 获取表格的列模型
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
 * 获取实体（Entity）的字段模型
 * 好像是后端复用了基础档案查询接口initgrid接口
 * 这个字段模型用于显示页面右侧的表单
 */

export function fetchEntityFieldsModel(baseDocId = 'entity') {
  // use `callAPIMiddleware`
  return {
    types: [ENTITY_FIELDS_MODEL_REQUEST, ENTITY_FIELDS_MODEL_SUCCESS, ENTITY_FIELDS_MODEL_FAILURE],
    // Check the cache (optional):
    //shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      const opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        mode: "cors",
        body: `doctype=${baseDocId}`
      };
      appendCredentials(opts);
      const url = `${FICLOUDPUB_INITGRID_URL}`;

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

            // 进行业务层的数据校验
            const [isValid, validationMessage] = utils.validation.tableColumnsModelData(json);
            if (isValid) {
              // 1. 删除不用的字段，按理说应该后端从response中删除掉的
              // 2. 修复后端json中的错别字，暂时在前端写死
              // 3. 后端数据类型使用int，前端使用string，暂时在前端写死
              // 4. 有些字段是必填项，暂时在前端写死
              // 5. 有些字段需要隐藏，暂时在前端写死
              // 6. 有些字段的类型错误，暂时在前端写死新类型
              // 7. 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
              // 8. 添加参照的配置
              let fields = json.data
                /* 1 */ .filter(utils.shouldNotRemoveFields.bind(this, baseDocId))
                /* 2 */ .map(utils.fixFieldTypo)
                /* 3 */ .map(utils.convertDataType)
                /* 4 */ .map(utils.setRequiredFields.bind(this, baseDocId))
                /* 5 */ .map(utils.setHiddenFields)
                /* 6 */ .map(utils.fixDataTypes.bind(this, baseDocId))
                /* 7 */ .map(utils.fixReferKey)
                /* 8 */ /* .map(utils.setReferFields.bind(this)) */;
              return {
                data: fields
              };
            } else {
              return receiveTableColumnsModelFail(
                `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
                但是数据校验方法提示说：“${validationMessage}”`,
                JSON.stringify(json.data, null, '  ')
              );
            }

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



