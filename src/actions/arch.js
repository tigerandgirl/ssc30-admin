import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

// 获取表格体数据(table body)，以及表格字段数据(table head)。

// 是否连接到阿里云接口
function aliyun(enable, url) {
  // 在编译环境下，需要默认启用阿里云接口
  if (process.env.NODE_ENV === 'production') enable = 1;
  return (enable ? '/ficloud' : '') + url;
}
var FICLOUDPUB_INITGRID_URL = aliyun(1, '/ficloud_pub/initgrid');
const SAVE_URL   = 1;
const DELETE_URL = 1;
const QUERY_URL  = 1;
function getSaveURL(type) {
  return aliyun(SAVE_URL, `/${type}/save`);
}
function getDeleteURL(type) {
  return aliyun(DELETE_URL, `/${type}/delete`);
}
function getQueryURL(type) {
  return aliyun(QUERY_URL, `/${type}/query`);
}

// Common helper -> utils.js/api.js
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

function parseJSON(response) {
  return response.json();
}

// 删除JSON object中的空值
// {
//   foo: 'bar',
//   bar: ''
// }
// 转换为
// {
//   foo: 'bar'
// }
const removeEmpty = (p) => {
  var key;
  for (key in p) {
    if (p.hasOwnProperty(key)) {
      if (!p[key]) {
        delete p[key]
      }
    }
  }
};

function requestTableData() {
  return {
    type: types.LOAD_TABLEDATA
  }
}

// 开始获取表格列模型
function requestTableColumnsModel() {
  return {
    type: types.LOAD_TABLECOLUMNS
  }
}

// 由于后端的数据结构改过几次，所以在这里处理变化后的映射关系。
function receiveTableBodyData(json, itemsPerPage) {
  if (json.success === true) {
    return {
      type: types.LOAD_TABLEDATA_SUCCESS,
      data: {
        items: json.data,
        totalCount: json.totalnum,
        totalPage: Math.ceil(json.totalnum / itemsPerPage)
      }
    };
  } else {
    // TODO: resBody不应该保存在adminAlert下，而是应该放在tableData下
    return receiveTableBodyDataFail('获取表格数据失败，后端返回的success是false',
      json.message);
  }
}

// message: 错误信息
// resBody: HTTP response body
function receiveTableBodyDataFail(message, resBody) {
  return {
    type: types.LOAD_TABLEDATA_FAIL,
    message,
    resBody
  };
}

function receiveTableColumnsModel(json) {
  if (json.success === true) {
    function fixFieldTypo (fields) {
      return fields.map(field => {
        field.label = field.lable; // API中将label错误的写成了lable
        field.key = field.id; // API后来将key改成了id
        // 将后端使用数字表示的data type转换成前端的名称
        const TYPE = [
          'string', 'integer', 'double', 'date', 'boolean', // 0~4
          'ref', 'enum', '', 'datetime', 'text' // 5~9
        ]
        field.type = TYPE[field.datatype];
        return field;
      });
    }
    return {
      type: types.LOAD_TABLECOLUMNS_SUCCESS,
      data: {
        fields: fixFieldTypo(json.data)
      }
    }
  } else {
    return {
      type: types.LOAD_TABLECOLUMNS_FAIL,
      message: '获取表格数据失败，后端返回的success是false',
      resBody: json.message
    }
  }
}

function deleteTableDataSuccess(json) {
  return {
    type: types.DELETE_TABLEDATA_SUCCESS,
    data: json.data
  }
}

// rowIdx是可选参数，只有当修改表格数据的时候才会传这个参数
function updateTableDataSuccess(json, rowIdx) {
  // 后端返回的response总包含了修改之后的值，填写到表格中
  // 隐藏editDialog和createDialog
  // 显示adminAlert呈现“保存成功”
  return {
    type: types.TABLEDATA_UPDATE_SUCCESS,
    data: {
      rowIdx,
      rowData: json.data // json.data中保存了后端返回的改行修改后的新数据
    }
  }
}

// 这个接口只获取表格体的数据
export function fetchTableBodyData(baseDocId, itemsPerPage, startIndex) {
  return (dispatch) => {
    dispatch(requestTableData());

    var opts = {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      mode: "cors",
      body: JSON.stringify({
        condition: '',
        begin: startIndex,
        groupnum: itemsPerPage
      })
    };

    var url = getQueryURL(baseDocId);
    return fetch(url, opts)
      .then(response => {
        // TODO: HTTP状态检查，需要独立成helper function
        if (response.status >= 200 && response.status < 300) {
          return response;
        } else {
          var error = new Error(response.statusText);
          error.response = response;
          response.text().then(text => {
            dispatch(receiveTableBodyDataFail('后端返回的HTTP status code不是200', text));
          });
          throw error;
        }
      })
      .then(parseJSON)
      .then(json => {
        dispatch(receiveTableBodyData(json, itemsPerPage));
      }).catch(function (err) {
        console.log("fetch error:", err);
      });
  }
}

export function fetchTableColumnsModel(baseDocId) {
  return (dispatch) => {
    dispatch(requestTableColumnsModel());

    var opts = {
      method: 'post',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      mode: "cors",
      body: `doctype=${baseDocId}`
    };

    var url = `${FICLOUDPUB_INITGRID_URL}`;
    return fetch(url, opts)
      .then(response => {
        return response.json();
      }).then(json => {
        dispatch(receiveTableColumnsModel(json));
      }).catch(function (err) {
        console.log("fetch error:", err);
      });
  }
}

export function deleteTableData(baseDocId, rowIdx, rowData) {
  return (dispatch, getState) => {
    var { id } = rowData; // 40位主键 primary key
    var opts = {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      mode: "cors",
      body: JSON.stringify({ id })
    };

    var url = getDeleteURL(baseDocId);
    return fetch(url, opts)
      .then(response => {
        return response.json();
      }).then(json => {
        dispatch(deleteTableDataSuccess(json));
      }).catch(function (err) {
        alert('删除时候出现错误');
        console.log("删除时候出现错误：", err);
      });
  }
}

// 创建和修改表格数据都会调用到这里
// rowIdx是可选参数，只有当修改表格数据（也就是点击表格每行最右侧的编辑按钮）
// 的时候才会传这个参数
export function saveTableData(baseDocId, formData, rowIdx) {
  return (dispatch, getState) => {
    removeEmpty(formData);
    var opts = {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      mode: "cors",
      body: JSON.stringify(formData)
    };

    var url = getSaveURL(baseDocId);
    return fetch(url, opts)
      .then(response => {
        return response.json();
      }).then(json => {
        dispatch(updateTableDataSuccess(json, rowIdx));
      }).catch(function (err) {
        alert('保存时候出现错误');
        console.log("保存时候出现错误：", err);
      });
  }
}

/**
 * @param {Object} [rowData] -  Table row data, e.g.
 * {
 *   id: '123',
 *   name: '456',
 *   mobileNumber: '1112223333'
 * }
 * When "CreateForm" call this, rowData will not pass, so we will try to get 
 * table column(form field) information from table rows.
 *
 * rowIdx表示当前打开的编辑框对应是表格中的哪一行，第一行的rowIdx=0
 */
export function showEditDialog(rowIdx, rowData) {
  return (dispatch, getState) => {
    dispatch({
      type: types.SHOW_EDIT_DIALOG,
      openDialog: true,
      formData: rowData,
      rowIdx
    })
  };
}

export function hideEditDialog() {
  return (dispatch, getState) => {
    dispatch({
      type: types.HIDE_EDIT_DIALOG,
      openDialog: false,
      formData: {},
      rowIdx: null
    })
  };
}

export function updateEditFormFieldValue(index, fieldModel, value) {
  return (dispatch, getState) => {
    // TODO(chenyangf@yonyou.com): Dont touch state when value not changed.
    dispatch({
      type: types.UPDATE_EDIT_FORM_FIELD_VALUE,
      id: fieldModel.id,
      payload: value
    });
  };
};

export function initEditFormData(editFormData) {
  return dispatch => {
    dispatch({
      type: types.ARCH_INIT_EDIT_FORM_DATA,
      editFormData
    });
  };
};

export function submitEditForm() {
  return (dispatch, getState) => {
    dispatch({
      type: types.SUBMIT_EDIT_FORM
    });
    const processResult = result => {
      result.error ?
        dispatch({
          type: types.SUBMIT_EDIT_FORM_FAIL,
          bsStyle: 'danger',
          message: result.error.message
        })
      :
        dispatch({
          type: types.SUBMIT_EDIT_FORM_SUCCESS,
          bsStyle: 'success',
          message: '提交成功'
        })
    };
    const { arch: { editFormData } } = getState();
    const idField = editFormData.find(field => field.label === 'id');
    const options = {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editFormData)
    };
    return fetch(`/api/arch/${idField.value}`, options)
      .then(checkStatus)
      .then(parseJSON)
      .then(processResult)
      .catch(error => {
        dispatch({
          type: types.SUBMIT_EDIT_FORM_FAIL,
          bsStyle: 'danger',
          message: error.message
        });
        throw error;
      });
  };
};

// create dialog

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
      if (state.arch.tableData.length !== 0) {
        rowData = state.arch.tableData[0];
      } else {
        // fake data
        rowData = {};
        rowData.cols = [
          { type: 'text', label: 'col1', value: '' },
          { type: 'text', label: 'col2', value: '' }
        ];
      }
      dispatch({
        type: types.SHOW_CREATE_DIALOG,
        openDialog: true,
        formData: rowData
      })
    } else {
      dispatch({
        type: types.SHOW_CREATE_DIALOG,
        openDialog: true,
        formData: rowData
      })
    }

  };
}

export function hideCreateDialog() {
  return (dispatch, getState) => {
    dispatch({
      type: types.HIDE_CREATE_DIALOG,
      openDialog: false,
      formData: {}
    })
  };
}

export function submitCreateForm() {
  return (dispatch, getState) => {
    dispatch({
      type: types.SUBMIT_CREATE_FORM
    });
    const processResult = result => {
      result.error ?
        dispatch({
          type: types.SUBMIT_CREATE_FORM_FAIL,
          bsStyle: 'danger',
          message: result.error.message
        })
      :
        dispatch({
          type: types.SUBMIT_CREATE_FORM_SUCCESS,
          bsStyle: 'success',
          message: '提交成功'
        })
    };
    const { arch: { createFormData } } = getState();
    const options = {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createFormData)
    };
    return fetch(`/api/arch`, options)
      .then(checkStatus)
      .then(parseJSON)
      .then(processResult)
      .catch(error => {
        dispatch({
          type: types.SUBMIT_CREATE_FORM_FAIL,
          bsStyle: 'danger',
          message: error.message
        });
        throw error;
      });
  };
};

export function initCreateFormData(formData) {
  return dispatch => {
    dispatch({
      type: types.INIT_CREATE_FORM_DATA,
      formData
    });
  };
};

export function updateCreateFormFieldValue(label, value) {
  return (dispatch, getState) => {
    const { arch: { fields } } = getState();
    const id = _.findIndex(fields, field => field.label === label);
    if (id === -1) {
      console.log('Not found this field:', label, ', in fields:', fields);
      return false;
    }
    // TODO(chenyangf@yonyou.com): Dont touch state when value not changed.
    dispatch({
      type: types.UPDATE_CREATE_FORM_FIELD_VALUE,
      id,
      payload: value
    });
  };
};

export function showAdminAlert() {
  return dispatch => {
    dispatch({
      type: types.SHOW_ADMIN_ALERT
    });
  };
};

export function hideAdminAlert() {
  return dispatch => {
    dispatch({
      type: types.HIDE_ADMIN_ALERT
    });
  };
};
