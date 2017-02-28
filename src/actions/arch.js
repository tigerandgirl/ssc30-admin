import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

// 阿里云后端
const ALIYUN_BACKEND_IP = '10.3.14.239';

// 获取表格体数据(table body)，以及表格字段数据(table head)。

// 是否连接到阿里云接口
function aliyun(enable, url) {
  // 在编译环境下，需要默认启用阿里云接口
  // 如果后端的阿里云服务器不好使了，比如出现500错误，那么注释掉下面一行。
  //if (process.env.NODE_ENV === 'production') enable = 1;
  return (enable ? `http://${ALIYUN_BACKEND_IP}/ficloud` : 'http://127.0.0.1:3009') + url;
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
function receiveTableBodyDataSuccess(json, itemsPerPage) {
  return {
    type: types.LOAD_TABLEDATA_SUCCESS,
    data: {
      items: json.data,
      totalCount: json.totalnum,
      totalPage: Math.ceil(json.totalnum / itemsPerPage)
    }
  };
}

// message: 错误信息
// resBody: HTTP response body
// TODO: resBody不应该保存在adminAlert下，而是应该放在tableData下
function receiveTableBodyDataFail(message, resBody) {
  return {
    type: types.LOAD_TABLEDATA_FAIL,
    message,
    resBody
  };
}

function receiveTableColumnsModelSuccess(json, fields) {
  return {
    type: types.LOAD_TABLECOLUMNS_SUCCESS,
    data: {
      fields
    }
  }
}

function receiveTableColumnsModelFail(json) {
  return {
    type: types.LOAD_TABLECOLUMNS_FAIL,
    message: '获取表格数据失败，后端返回的success是false',
    resBody: json.message
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

function updateTableDataFail(message, resBody) {
  return {
    type: types.TABLEDATA_UPDATE_FAIL,
    message,
    resBody
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
        if (json.success === true) {
          dispatch(receiveTableBodyDataSuccess(json, itemsPerPage));
        } else {
          dispatch(receiveTableBodyDataFail('获取表格数据失败，后端返回的success是false',
            json.message));
        }
      }).catch(function (err) {
        console.log("fetch table body error:", err);
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
          function hideSpecialColumns(fileds) {
            function shouldHideColumn(id) {
              // id，主键
              if ('id'.indexOf(id) !== -1) {
                return true;
              }
              // name开头，后面跟数字
              if (/^name\d+/g.exec(id) !== null) {
                return true;
              }
              return false;
            }
            return fields.map(field => {
              let newField = {...field};
              if (shouldHideColumn(field.id)) {
                newField.hidden = true;
              }
              return newField;
            });
          }
          let fields = fixFieldTypo(json.data);
          fields = hideSpecialColumns(fields);
          dispatch(receiveTableColumnsModelSuccess(json, fields));
        } else {
          dispatch(receiveTableColumnsModelFail(json));
        }
      }).catch(function (err) {
        console.log("fetch table columns error:", err);
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

    function checkHTTPStatus(response) {
      // TODO: HTTP状态检查，需要独立成helper function
      if (response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);
        error.response = response;
        response.text().then(text => {
          dispatch(updateTableDataFail(('后端返回的HTTP status code不是200', text)));
        });
        throw error;
      }
    }

    function processJSONResult(json) {
      if (json.success === true) {
        dispatch(updateTableDataSuccess(json, rowIdx));
      } else {
        dispatch(updateTableDataFail('获取表格数据失败，后端返回的success是false',
          json.message));
      }
    }

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
      .then(checkHTTPStatus)
      .then(parseJSON)
      .then(processJSONResult)
      .catch(function (err) {
        console.log("保存基础档案时候出现错误：", err);
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

export function closeEditDialog() {
  return (dispatch, getState) => {
    dispatch({
      type: types.EDIT_DIALOG_CLOSE,
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
export function showCreateDialog(rowData) {
  return (dispatch, getState) => {
    dispatch({
      type: types.SHOW_CREATE_DIALOG,
      openDialog: true,
      formData: rowData
    });
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

// 页面上的消息框

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

// 对话框中的消息框

export function showFormAlert() {
  return dispatch => {
    dispatch({
      type: types.FORM_ALERT_OPEN
    });
  };
};

export function hideFormAlert() {
  return dispatch => {
    dispatch({
      type: types.FORM_ALERT_CLOSE
    });
  };
};
