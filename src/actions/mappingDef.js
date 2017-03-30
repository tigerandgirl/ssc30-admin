/**
 * 转换规则定义
 * mapdef.md
 */

import fetch from 'isomorphic-fetch';

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
 * * -1 使用本地的expressjs服务器伪造数据
 * *  0 使用后端开发人员提供的开发机上跑的服务
 * *  1 使用后端提供的测试服务器
 */
const DEV_BACKEND_INDEX = 1;

/**
 * 根据配置获取到基础档案的绝对路径
 * 比如：http://127.0.0.1:3009/dept/query
 */
function getBaseDocURL(path) {
  const url = server => `http://${server}${path}`;
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return url(process.env.PROD_SERVER);
  }
  if (DEV_BACKEND_INDEX === -1) {
    return url(URL.LOCAL_EXPRESS_SERVER);
  }
  return url(URL.YBZ_BASEDOC_DEV_SERVERS[DEV_BACKEND_INDEX]);
}

/**
 * 根据配置获取到实体模型的绝对路径
 * 比如：http://10.1.218.36:8080/ficloud/mappingdef/query
 */
function getMappingDefAPI(path) {
  const url = server => `http://${server}${path}`;
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return url(process.env.PROD_SERVER);
  }
  if (DEV_BACKEND_INDEX === -1) {
    return url(URL.LOCAL_EXPRESS_SERVER);
  }
  return url(URL.MAPPING_DEF_DEV_SERVERS[DEV_BACKEND_INDEX]);
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

export function fetchTableColumnsModel(baseDocId) {
  // use `callAPIMiddleware`
  return {
    types: [TABLE_COLUMNS_MODEL_REQUEST, TABLE_COLUMNS_MODEL_SUCCESS, TABLE_COLUMNS_MODEL_FAILURE],
    // Check the cache (optional):
    // shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      const opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/x-www-form-urlencoded'
        },
        mode: 'cors',
        body: `doctype=${baseDocId}`
      };
      appendCredentials(opts);
      const url = `${FICLOUDPUB_INITGRID_URL}`;

      return fetch(url, opts)
        .then(utils.checkHTTPStatus)
        .then(utils.parseJSON)
        .then(resObj => {
          if (resObj.success === true) {

            // 进行业务层的数据校验
            const [isValid, validationMessage] = utils.validation.tableColumnsModelData(resObj);
            if (isValid) {
              // 1. 删除不用的字段，按理说应该后端从response中删除掉的
              // 2. 修复后端json中的错别字，暂时在前端写死
              // 3. 后端数据类型使用int，前端使用string，暂时在前端写死
              // 4. 有些字段是必填项，暂时在前端写死
              // 5. 有些字段需要隐藏，暂时在前端写死
              // 6. 有些字段的类型错误，暂时在前端写死新类型
              // 7. 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
              // 8. 添加参照的配置
              let fields = resObj.data
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
            }

            throw {
              name: 'INVALID_JSON',
              message: `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
              但是数据校验方法提示说：“${validationMessage}”`
            };
          } else {
            throw {
              name: 'SUCCESS_FALSE',
              message: resObj.message || '未知错误'
            };
          }
        });
    }
  };
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
