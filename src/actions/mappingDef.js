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
 * 根据配置获取到实体模型的绝对路径
 * 比如：http://10.1.218.36:8080/ficloud_web/mappingdef/query
 */
function getMappingDefAPI(path) {
  // 生产环境下直接使用生产服务器IP
  if (process.env.NODE_ENV === 'production') {
    return 'http://' + URL.PROD_SERVER + path;
  }
  return (ENABLE_DEV_BACKEND
    ? `http://${URL.CONVERSION_RULE_DEFINITION_DEV_SERVER}`
    : `http://${URL.LOCAL_EXPRESS_SERVER}`) + path;
}

/**
 * 基础档案 组装后端接口
 */
const FICLOUDPUB_INITGRID_URL = getBaseDocURL('/ficloud_pub/initgrid');

/**
 * 转换规则模型 组装后端接口
 */
const QUERY_CONVERSION_RULE_DEFINITION_URL = getMappingDefAPI('/ficloud_web/mappingdef/query');

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
    //shouldCallAPI: (state) => !state.posts[userId],
    callAPI: () => {
      var opts = {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify({
          condition: '',
          paras: [],
          fields: [],
          begin: startIndex,
          groupnum: itemsPerPage
        })
      };
      appendCredentials(opts);

      var url = `${QUERY_CONVERSION_RULE_DEFINITION_URL}`;

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

// NC sync: delete data

export const CONVERSION_RULE_DEFINITION_DELETE_REQUEST  = 'CONVERSION_RULE_DEFINITION_DELETE_REQUEST';
export const CONVERSION_RULE_DEFINITION_DELETE_SUCCESS  = 'CONVERSION_RULE_DEFINITION_DELETE_SUCCESS';
export const CONVERSION_RULE_DEFINITION_DELETE_FAILURE  = 'CONVERSION_RULE_DEFINITION_DELETE_FAILURE';

const deleteNCSyncRequest = createAction(CONVERSION_RULE_DEFINITION_DELETE_REQUEST);
const deleteNCSyncSuccess = createAction(CONVERSION_RULE_DEFINITION_DELETE_SUCCESS, data => data);
const deleteNCSyncFailure = createAction(CONVERSION_RULE_DEFINITION_DELETE_FAILURE,
  (bsStyle, message) => ({bsStyle, message})
);

export const deleteTableData = () => {
  return (dispatch, getState) => {
    dispatch(deleteNCSyncRequest());
    const { ncSync: { selectedRows } } = getState();

    const dataIds = [];
    Object.keys(selectedRows).map(function(value, index) {
      dataIds.push(index);
    });
    const dataIdsStr = dataIds.join(',');

    if (!dataIdsStr) {
      console.log('Not selected any row');
    }

    const opts = {
      method: 'delete',
    };
    // /api/ncsync/100,102,103
    var url = `/api/ncsync/${dataIdsStr}`;
    return fetch(url, opts)
      .then( utils.checkStatus )
      .then( utils.parseJSON )
      .then( json => dispatch(deleteNCSyncSuccess(json.data)) )
      .catch( error => dispatch(deleteNCSyncFailure('danger', error.message)) );
  }
}

// NC sync: update data

export const SUBMIT_EDIT_FORM = 'SUBMIT_EDIT_FORM';
export const SUBMIT_EDIT_FORM_SUCCESS = 'SUBMIT_EDIT_FORM_SUCCESS';
export const SUBMIT_EDIT_FORM_FAIL = 'SUBMIT_EDIT_FORM_FAIL';

export function submitEditForm() {
  return (dispatch, getState) => {
    dispatch({
      type: SUBMIT_EDIT_FORM
    });
    const processResult = result => {
      result.error ?
        dispatch({
          type: SUBMIT_EDIT_FORM_FAIL,
          bsStyle: 'danger',
          message: result.error.message
        })
      :
        dispatch({
          type: SUBMIT_EDIT_FORM_SUCCESS,
          bsStyle: 'success',
          message: '提交成功'
        })
    };
    const { ncSync: { editFormData } } = getState();
    const idField = editFormData.find(field => field.label === 'id');
    const options = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editFormData)
    };
    return fetch(`/api/ncsync/${idField.value}`, options)
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(processResult)
      .catch(error => {
        dispatch({
          type: SUBMIT_EDIT_FORM_FAIL,
          bsStyle: 'danger',
          message: error.message
        });
        throw error;
      });
  };
};

// NC sync: create new data

export const SUBMIT_CREATE_FORM = 'SUBMIT_CREATE_FORM';
export const SUBMIT_CREATE_FORM_SUCCESS = 'SUBMIT_CREATE_FORM_SUCCESS';
export const SUBMIT_CREATE_FORM_FAIL = 'SUBMIT_CREATE_FORM_FAIL';

export function submitCreateForm() {
  return (dispatch, getState) => {
    dispatch({
      type: SUBMIT_CREATE_FORM
    });
    const processResult = result => {
      result.error ?
        dispatch({
          type: SUBMIT_CREATE_FORM_FAIL,
          bsStyle: 'danger',
          message: result.error.message
        })
      :
        dispatch({
          type: SUBMIT_CREATE_FORM_SUCCESS,
          bsStyle: 'success',
          message: '提交成功'
        })
    };
    const { ncSync: { createFormData } } = getState();
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createFormData)
    };
    return fetch(`/api/ncsync`, options)
      .then(utils.checkStatus)
      .then(utils.parseJSON)
      .then(processResult)
      .catch(error => {
        dispatch({
          type: SUBMIT_CREATE_FORM_FAIL,
          bsStyle: 'danger',
          message: error.message
        });
        throw error;
      });
  };
};

// NC sync config: fetch data

export const CONVERSION_RULE_DEFINITION_CONFIG_REQUEST = 'CONVERSION_RULE_DEFINITION_CONFIG_REQUEST';
export const CONVERSION_RULE_DEFINITION_CONFIG_SUCCESS = 'CONVERSION_RULE_DEFINITION_CONFIG_SUCCESS';
export const CONVERSION_RULE_DEFINITION_CONFIG_FAILURE = 'CONVERSION_RULE_DEFINITION_CONFIG_FAILURE';

const configRequest = createAction(CONVERSION_RULE_DEFINITION_CONFIG_REQUEST);
const configSuccess = createAction(CONVERSION_RULE_DEFINITION_CONFIG_SUCCESS, data => data);
const configFailure = createAction(CONVERSION_RULE_DEFINITION_CONFIG_FAILURE,
  (bsStyle, message) => ({bsStyle, message})
);

export const fetchConfigData = () => {
  return (dispatch) => {
    dispatch(configRequest());
    var opts = {
      method: 'get',
      headers: {
        'Content-type': 'application/json'
      },
      mode: "cors"
    };

    var url = `/api/ncsync/config`;

    return fetch(url, opts)
      .then(response => {
        return response.json();
      }).then(json => {
        dispatch(configSuccess(json));
      }).catch(error => {
        console.log("fetch error:", error);
        dispatch(configFailure('danger', error.message));
      });
  }
}

// Table view

export const CHANGE_SELECTED_ROWS = 'CHANGE_SELECTED_ROWS';

export function changeSelectedRows(rowId, checked) {
  return (dispatch, getState) => {
    const { ncSync: { selectedRows } } = getState();

    if (selectedRows[rowId]) {
      delete selectedRows[rowId];
    } else {
      selectedRows[rowId] = true;
    }

    dispatch({
      type: CHANGE_SELECTED_ROWS,
      selectedRows
    })
  }
}

// AdminEditDialog view

export const CONVERSION_RULE_DEFINITION_EDIT_DIALOG_SHOW = 'CONVERSION_RULE_DEFINITION_EDIT_DIALOG_SHOW';
export const CONVERSION_RULE_DEFINITION_EDIT_DIALOG_HIDE = 'CONVERSION_RULE_DEFINITION_EDIT_DIALOG_HIDE';

/**
 * @param {Object} [rowData] -  Table row data, e.g.
 * {
 *   "cols": [
 *     {},
 *     {}
 *   ]
 * }
 * When "CreateForm" call this, rowData will not pass, so we will try to get 
 * table column(form field) information from table rows.
 */
export function showEditDialog(rowId, rowData) {
  return (dispatch, getState) => {
    if (!rowData) {
      let rowData;
      const state = getState();
      if (state.ncSync.tableData.items.length !== 0) {
        rowData = state.ncSync.tableData.items[0];
      } else {
        // fake data
        rowData = {};
        rowData.cols = [
          { type: 'text', label: 'col1', value: '' },
          { type: 'text', label: 'col2', value: '' }
        ];
      }
      dispatch({
        type: CONVERSION_RULE_DEFINITION_EDIT_DIALOG_SHOW,
        openDialog: true,
        formData: rowData.cols
      })
    } else {
      dispatch({
        type: CONVERSION_RULE_DEFINITION_EDIT_DIALOG_HIDE,
        openDialog: true,
        formData: rowData.cols
      })
    }

  };
}

export function hideEditDialog() {
  return (dispatch, getState) => {
    dispatch({
      type: CONVERSION_RULE_DEFINITION_EDIT_DIALOG_HIDE,
      openDialog: false,
      formData: []
    })
  };
}

// Edit form view

export function updateEditFormFieldValue(label, value) {
  return (dispatch, getState) => {
    const { ncSync: { editFormData } } = getState();
    const id = _.findIndex(editFormData, field => field.label === label);
    if (id === -1) {
      console.log('Not found this field:', label, ', in editFormData:', editFormData);
      return false;
    }
    // TODO(chenyangf@yonyou.com): Dont touch state when value not changed.
    dispatch({
      type: UPDATE_EDIT_FORM_FIELD_VALUE,
      id,
      payload: value
    });
  };
};

export const INIT_EDIT_FORM_DATA = 'INIT_EDIT_FORM_DATA';
export const UPDATE_EDIT_FORM_FIELD_VALUE = 'UPDATE_EDIT_FORM_FIELD_VALUE';

export function initEditFormData(editFormData) {
  return dispatch => {
    dispatch({
      type: INIT_EDIT_FORM_DATA,
      editFormData
    });
  };
};

// dialog view

export const CONVERSION_RULE_DEFINITION_CREATE_DIALOG_SHOW = 'CONVERSION_RULE_DEFINITION_CREATE_DIALOG_SHOW';
export const CONVERSION_RULE_DEFINITION_CREATE_DIALOG_HIDE = 'CONVERSION_RULE_DEFINITION_CREATE_DIALOG_HIDE';

/**
 * @param {Object} [rowData] -  Table row data, e.g.
 * {
 *   "cols": [
 *     {},
 *     {}
 *   ]
 * }
 * When "CreateForm" call this, rowData will not pass, so we will try to get 
 * table column(form field) information from table rows.
 */
export function showCreateDialog(rowId, rowData) {
  return (dispatch, getState) => {
    if (!rowData) {
      let rowData;
      const state = getState();
      if (state.ncSync.tableData.items.length !== 0) {
        rowData = state.ncSync.tableData.items[0];
      } else {
        // fake data
        rowData = {};
        rowData.cols = [
          { type: 'text', label: 'col1', value: '' },
          { type: 'text', label: 'col2', value: '' }
        ];
      }
      dispatch({
        type: CONVERSION_RULE_DEFINITION_CREATE_DIALOG_SHOW,
        openDialog: true,
        formData: rowData.cols
      })
    } else {
      dispatch({
        type: CONVERSION_RULE_DEFINITION_CREATE_DIALOG_SHOW,
        openDialog: true,
        formData: rowData.cols
      })
    }

  };
}

export function hideCreateDialog() {
  return (dispatch, getState) => {
    dispatch({
      type: CONVERSION_RULE_DEFINITION_CREATE_DIALOG_HIDE,
      openDialog: false,
      formData: []
    })
  };
}

export const INIT_CREATE_FORM_DATA = 'INIT_CREATE_FORM_DATA';
export const UPDATE_CREATE_FORM_FIELD_VALUE = 'UPDATE_CREATE_FORM_FIELD_VALUE';

export function initCreateFormData(formData) {
  return dispatch => {
    dispatch({
      type: INIT_CREATE_FORM_DATA,
      formData
    });
  };
};

export function updateCreateFormFieldValue(label, value) {
  return (dispatch, getState) => {
    const { ncSync: { createFormData } } = getState();
    const id = _.findIndex(createFormData, field => field.label === label);
    if (id === -1) {
      console.log('Not found this field:', label, ', in createFormData:', createFormData);
      return false;
    }
    // TODO(chenyangf@yonyou.com): Dont touch state when value not changed.
    dispatch({
      type: UPDATE_CREATE_FORM_FIELD_VALUE,
      id,
      payload: value
    });
  };
};

// alert view

export const CONVERSION_RULE_DEFINITION_ADMIN_ALERT_SHOW = 'CONVERSION_RULE_DEFINITION_ADMIN_ALERT_SHOW';
export const CONVERSION_RULE_DEFINITION_ADMIN_ALERT_HIDE = 'CONVERSION_RULE_DEFINITION_ADMIN_ALERT_HIDE';

export function showAdminAlert() {
  return dispatch => {
    dispatch({
      type: CONVERSION_RULE_DEFINITION_ADMIN_ALERT_SHOW
    });
  };
};

export function hideAdminAlert() {
  return dispatch => {
    dispatch({
      type: CONVERSION_RULE_DEFINITION_ADMIN_ALERT_HIDE
    });
  };
};