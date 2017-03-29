/**
 * 转换规则定义
 * mapdef.md
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
    return 'http://' + process.env.YZB_PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.BASEDOC_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

/**
 * 根据配置获取到实体模型的绝对路径
 * 比如：http://10.1.218.36:8080/ficloud/mappingdef/query
 */
function getMappingDefAPI(path) {
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return 'http://' + process.env.YZB_PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.CONVERSION_RULE_DEFINITION_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

/**
 * 基础档案 组装后端接口
 */
const FICLOUDPUB_INITGRID_URL = getBaseDocURL('/ficloud/ficloud_pub/initgrid');

/**
 * 转换规则模型 组装后端接口
 */
const QUERY_CONVERSION_RULE_DEFINITION_URL = getMappingDefAPI('/ficloud/mappingdef/query');

/** 配置Fetch API的credentials参数 */
function appendCredentials(opts) {
  if (FETCH_CREDENTIALS_OPTION) {
    opts.credentials = FETCH_CREDENTIALS_OPTION;
  }
  return opts;
}

/**
 * 获取表格的列模型
 */

export const TABLE_COLUMNS_MODEL_REQUEST = 'TABLE_COLUMNS_MODEL_REQUEST';
export const TABLE_COLUMNS_MODEL_SUCCESS = 'TABLE_COLUMNS_MODEL_SUCCESS';
export const TABLE_COLUMNS_MODEL_FAILURE = 'TABLE_COLUMNS_MODEL_FAILURE';

// 获取表格列模型失败
// message: 错误信息
// details: 比如HTTP response body，或者其他为了踢皮球而写的比较啰嗦的文字
function receiveTableColumnsModelFail(message, details) {
  return {
    type: types.LOAD_TABLECOLUMNS_FAIL,
    message, details
  }
}

export function fetchTableColumnsModel(baseDocId) {
  // use `callAPIMiddleware`
  return {
    types: [TABLE_COLUMNS_MODEL_REQUEST, TABLE_COLUMNS_MODEL_SUCCESS, TABLE_COLUMNS_MODEL_FAILURE],
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

/**
 * 获取实体模型
 */

export const CONVERSION_RULE_DEFINITION_REQUEST = 'CONVERSION_RULE_DEFINITION_REQUEST';
export const CONVERSION_RULE_DEFINITION_SUCCESS = 'CONVERSION_RULE_DEFINITION_SUCCESS';
export const CONVERSION_RULE_DEFINITION_FAILURE = 'CONVERSION_RULE_DEFINITION_FAILURE';

export function fetchTableBodyData(itemsPerPage, startIndex) {
  // use `callAPIMiddleware`
  return {
    types: [CONVERSION_RULE_DEFINITION_REQUEST, CONVERSION_RULE_DEFINITION_SUCCESS, CONVERSION_RULE_DEFINITION_FAILURE],
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
          conditions: [],
          paras: [],
          fields: [],
          begin: startIndex,
          groupnum: itemsPerPage
        })
      };
      appendCredentials(opts);

      let url = `${QUERY_CONVERSION_RULE_DEFINITION_URL}`;

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
 * 用于显示错误的tooltip
 */

export const SHOW_PAGE_ALERT = 'SHOW_PAGE_ALERT';

/**
 * @param {Boolean} show 是否显示
 */
export function showPageAlert(show) {
  return dispatch => {
    dispatch({
      type: SHOW_PAGE_ALERT,
      show
    });
  };
}
