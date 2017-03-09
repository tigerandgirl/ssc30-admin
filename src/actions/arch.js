import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

// 阿里云后端
const ALIYUN_BACKEND_IP = '10.3.14.239';

// 后端接口是否需要权限校验
const BACKEND_CREDENTIALS = false;

// 参照的后端URL
const ReferDataURL = 'http://10.3.14.239/ficloud/refbase_ctr/queryRefJSON';

// 获取表格体数据(table body)，以及表格字段数据(table head)。

// 是否连接到阿里云接口
function aliyun(enable, url) {
  // 在编译环境下，需要默认启用阿里云接口
  // 如果后端的阿里云服务器不好使了，比如出现500错误，那么注释掉下面一行。
  if (process.env.NODE_ENV === 'production') enable = 1;
  return (enable ? `http://${ALIYUN_BACKEND_IP}/ficloud` : 'http://127.0.0.1:3009/ficloud') + url;
}

const FICLOUDPUB_INITGRID_URL = aliyun(0, '/ficloud_pub/initgrid');
const getSaveURL = type => aliyun(0, `/${type}/save`);
const getDeleteURL = type => aliyun(0, `/${type}/delete`);
const getQueryURL = type => aliyun(0, `/${type}/query`);

// 添加权限
function appendCredentials(opts) {
  if (BACKEND_CREDENTIALS) {
    opts.credentials = 'include';
  }
  return opts;
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

function isRequiredField(baseDocId, fieldId) {
  const data = {
    dept: {
      code: true, // dept的code字段是必输字段
      name: true,
      person: true,
      pk_org: true
    },
    project: {
      code: true,
      name: true,
      classifyid: true
    },
    projectclass: {
      code: true,
      name: true
    },
    user: {
      name: true,
      sex: true,
      email: true,
      positionstate: true
    },
    accperiod: { // 会计期间
      pk_org: true,
      description: true,
      code: true,
      name: true,
      accperiodscheme: true,
      begindate: true,
      enddate: true,
      num: true,
      enable: true
    },
    currency: { // 币种
      pk_org: true,
      description: true,
      code: true,
      name: true,
      moneydigit: true,
      moneyrount: true,
      pricedigit: true,
      pricerount: true,
      sign: true
    },
    bank: { // 银行
      pk_org: true,
      description: true,
      code: true,
      name: true,
      classifyid: true,
      parentid: true,
      enable: true
    },
    bankaccount: { // 银行账户
      pk_org: true,
      description: true,
      code: true,
      name: true,
      depositbank: true,
      bank: true,
      accountproperty: true,
      accounttype: true,
      enable: true
    }
  };
  return data[baseDocId] ? data[baseDocId][fieldId] === true : false;
}

// 开始获取表格列模型
function requestTableColumnsModel() {
  return {
    type: types.LOAD_TABLECOLUMNS
  }
}
// 获取表格列模型成功
function receiveTableColumnsModelSuccess(json, fields) {
  return {
    type: types.LOAD_TABLECOLUMNS_SUCCESS,
    data: {
      fields
    }
  }
}
// 获取表格列模型失败
// message: 错误信息
// details: 比如HTTP response body，或者其他为了踢皮球而写的比较啰嗦的文字
function receiveTableColumnsModelFail(message, details) {
  return {
    type: types.LOAD_TABLECOLUMNS_FAIL,
    message, details
  }
}

// 开始获取表格体数据
function requestTableData() {
  return {
    type: types.LOAD_TABLEDATA
  }
}
// 成功获取到表格体数据
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
// 获取表格体数据失败
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

/**
 * 对后端生成的JSON做校验
 * 这里假设JSON本身是valid，但是需要再次确认业务层如何看待这些数据是否为valid
 */
const validation = {
  /**
   * 检查columnsModel中：
   * - 是否有重复的id
   * @param {object} 经过parse的后端返回的JSON
   * @return {array} [isValid, message]
   *   - `isValid` 是否校验成功
   *   - `message` 校验失败的时候，用来提供相应的错误信息
   */
  tableColumnsModelData: json => {
    let isValid = true;
    let message = '';
    // 获取所有columnModel的id，检查是否有重复，否则在之后表格的绘制，以及
    // 基于现有model提交新数据等环节，都有很大可能导致意想不到的问题。
    let ids = json.data.map(columnModel => columnModel.id);
    let duplicatedIds = _.filter(ids, function (value, index, iteratee) {
      return _.includes(iteratee, value, index + 1);
    });
    if (_.isEmpty(duplicatedIds)) {
    } else {
      isValid = false;
      message = `JSON中出现了重复的id：${duplicatedIds}，请立即停止所有操作，
        否则可能产生意想不到的结果！如果你不明白这里发生了什么事情，请咨询网站管理员。
        由于当前网站管理员不存在，你可以尝试绕过网站管理员，直接联系程序员，比如
        你可以尝试联系chenyangf@yonyou.com，也许可能会帮助到你。`;
    }
    return [isValid, message];
  }
};

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
    appendCredentials(opts);

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
          // 进行业务层的数据校验
          const [isValid, validationMessage] = validation.tableColumnsModelData(json);
          if (isValid) {
            dispatch(receiveTableBodyDataSuccess(json, itemsPerPage));
          } else {
            dispatch(receiveTableBodyDataFail(
              `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
              但是数据校验方法提示说：“${validationMessage}”`,
              JSON.stringify(json.data, null, '  ')
            ));
          }
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
        'Content-type': 'application/x-www-form-urlencoded'//,
        //'Cookie': 'JSESSIONID=F0F88957BD3C1D6A07DFD36342DDA85F; JSESSIONID=D4D2196BE3223A695DA71EAED9AD93BD; _ga=GA1.1.359480174.1488286701; tenant_username=ST-36826-ojRQCYPdYRcN9IzSQa3H-cas01.example.org__635c1227-8bcb-4f65-b64d-4d07224101f5; tenant_token=YEI2AhHB42hgnqSuvuF8giN%2Bwjgm5LmzcXb0qRBee5sC8el7vf0Zi%2Bh%2B%2Bjn5HzH%2FKMhsx4DpzJsZNFZOvRffUg%3D%3D; SERVERID=aa7d5a15ad52d23df4ab9aa3ef3a436c|1488335283|1488335175'
      },
      mode: "cors",
      body: `doctype=${baseDocId}`
    };
    appendCredentials(opts);

    var url = `${FICLOUDPUB_INITGRID_URL}`;
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
      .then(response => {
        return response.json();
      }).then(json => {
        if (json.success === true) {
          // 做两件事情，需要拆分：
          // 1. 后端使用lable，需要复制一份改成label，以保证Grid组件等没有问题
          // 2. 对于数据类型，后端使用int，前端使用string，添加string类型的type字段
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
          // 有些字段需要隐藏，但是又不是在JSON中使用hidden来控制的，
          // 而是口口相传的，所以写在这里
          function hideSpecialColumns(fields) {
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

          function setRequiredFields(field) {
            if (isRequiredField(baseDocId, field.id)) {
              field.validation = {
                type: 'required'
              };
            }
            return field;
          }

          const getReferConfig = baseDocId => ({
            referConditions: {
              refCode: baseDocId, // 'dept',
              refType: 'tree',
              rootName: '部门'
            },
            referDataUrl: ReferDataURL
          });

          function setReferFields(field) {
            if (field.type === 'ref') {
              field.referConfig = getReferConfig(baseDocId);
            }
            return field;
          }

          // 进行业务层的数据校验
          const [isValid, validationMessage] = validation.tableColumnsModelData(json);
          if (isValid) {
            // 处理后端数据
            let fields = fixFieldTypo(json.data);
            fields = hideSpecialColumns(fields);

            // 有些字段是必填项，暂时在前端写死
            fields = fields.map(setRequiredFields);
            // 添加参照的配置
            fields = fields.map(setReferFields);

            dispatch(receiveTableColumnsModelSuccess(json, fields));
          } else {
            dispatch(receiveTableColumnsModelFail(
              `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
              但是数据校验方法提示说：“${validationMessage}”`,
              JSON.stringify(json.data, null, '  ')
            ));
          }

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
    appendCredentials(opts);

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
    appendCredentials(opts);

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
    appendCredentials(options);
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
    appendCredentials(options);
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

function updateErrorMessages(message) {
  return {
    type: types.ERROR_MESSAGES_UPDATE,
    message
  }
}

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
