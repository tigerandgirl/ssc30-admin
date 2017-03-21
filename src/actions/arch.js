import * as types from '../constants/ActionTypes';
import fetch from 'isomorphic-fetch';
import _ from 'lodash';

/**
 * 后端接口
 * 比如: LOCAL_EXPRESS_SERVER = '127.0.0.1:3009'
 */
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
 * 基础档案 组装后端接口
 */
const FICLOUDPUB_INITGRID_URL = getBaseDocURL('/ficloud_pub/initgrid');
const QUERY_DOCTYPE_URL = getBaseDocURL('/ficloud_pub/querydoctype');
const getSaveURL = type => getBaseDocURL(`/${type}/save`);
const getDeleteURL = type => getBaseDocURL(`/${type}/delete`);
const getQueryURL = type => getBaseDocURL(`/${type}/query`);
/**
 * 参照 组装后端接口
 */
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
 * 常用的helper function
 * 可以扔到utils.js中
 */

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

/**
 * 删除JSON object中的空值，空字符串除外
 * {
 *   foo: 'bar',
 *   bar: '',
 *   bar2: null,
 *   bar3: undefined
 * }
 * 转换为
 * {
 *   foo: 'bar'
 *   bar: ''
 * }
 * 注意：不会修改输入的obj参数
 */
const removeEmpty = (obj) => {
  var prop, newObj = {};
  for (prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop] == null || obj[prop] == undefined) {
        continue;
      }
      newObj[prop] = obj[prop];
    }
  }
  return newObj
};

/**
 * 处理后端数据的方法
 * 这些方法应该是immutable
 */

/**
 * 做两件事情，需要拆分：
 * 1. 后端使用lable，需要复制一份改成label，以保证Grid组件等没有问题
 * 2. 对于数据类型，后端使用int，前端使用string，添加string类型的type字段
 */
function fixFieldTypo ({...field}) {
  field.label = field.lable; // API中将label错误的写成了lable
  field.key = field.id; // API后来将key改成了id
  return field;
}

/**
 * 将后端使用数字表示的data type转换成前端的名称
 * 后端使用datatype=0, 前端使用type='string'
 */
function convertDataType({...field}) {
  const TYPE = [
    'string', 'integer', 'double', 'date', 'boolean', // 0~4
    'ref', 'enum', '', 'datetime', 'text' // 5~9
  ]
  field.type = TYPE[field.datatype];
  return field;
}

/**
 * 根据指定的档案类型和字段id，判断指定字段是否为必填项
 * 目前将这些数据在前端写死
 */
function setRequiredFields(baseDocId, {...field}) {
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
      enable: true
    },
    bankaccount: { // 银行账户
      pk_org: true,
      code: true,
      name: true,
      depositbank: true,
      bank: true,
      defaultaccount: true,
      accountproperty: true,
      accounttype: true
    }
  };
  if (data[baseDocId] && data[baseDocId][field.id] === true) {
    field.validation = {
      type: 'required'
    };
  }
  return field;
}

/**
 * 有些字段需要隐藏，暂时写死在前端
 * 有些字段需要隐藏，但是又不是在JSON中使用hidden来控制的，
 * 而是口口相传的，所以写在这里
 */
function shouldNotRemoveFields(baseDocId, {...field}) {
  let shouldNotRemove = true;
  // 将需要隐藏的字段设置为true，如果不指定，或者设定为false说明不隐藏
  // 仅需要将打算隐藏的字段列出来。
  const data = {
    "accbook": {
      "pk_org": true
    },
    "accelement": {
      "pk_org": true
    },
    "accperiod": {
      "pk_org": true
    },
    "accperiodscheme": {
      "pk_org": true
    },
    "accstandard": {
      "pk_org": true
    },
    "accsubjectchart": {
      "pk_org": true
    },
    "bank": {
      "pk_org": true,
      description: true,
      enable: true,
      classifyid: false
    },
    "bankaccount": {
      "pk_org": true,
      description: true
    },
    "bankclass": {
      "pk_org": true
    },
    "currency": {
      "pk_org": true,
      description: true,
      pricerount: true,
      moneyrount: true
    },
    "dept": {
      "pk_org": true
    },
    "feeitem": {
      "pk_org": true
    },
    "feeitemclass": {
      "pk_org": true
    },
    "measuredoc": {
      "pk_org": true
    },
    "multidimension": {
      "pk_org": true
    },
    "project": {
      "pk_org": true
    },
    "projectclass": {
      "pk_org": true
    },
    "subjectchart": {
      "pk_org": true
    },
    "user": {
      "pk_org": true
    },
    "valuerang": {
      "pk_org": true
    }
  };

  // 按照业务的要求，这些字段是不需要的，但是后端非得传，
  // 所以暂时写死在前端
  if (data[baseDocId] && data[baseDocId][field.id] === true) {
    shouldNotRemove = false;
  }
  // 以name开头后面跟数字，比如name2，这样的字段需要删除
  if (/^name\d+/g.exec(field.id) !== null) {
    shouldNotRemove = false;
  }
  return shouldNotRemove;
}

/**
 * 设定隐藏字段
 * 比如id字段是主键，不需要在表格中以及表单中显示，但是当往后端发送请求的时候，
 * 需要带有该id
 */
function setHiddenFields({...field}) {
  if (field.id === 'id') {
    field.hidden = true;
  }
  return field;
}

/**
 * 后端返回的数据类型可能有错误，在这里进行修复
 * 说一个实际需求：
 * 需求：https://www.teambition.com/project/5782fc6449d32145686e17d7/tasks/scrum/5782fc65fa04c23d7e9abf52/task/58c7410f95e23eae620600ab
 * 【银行账号 - 账户性质应为下拉框形式】
 * 对于“账户性质”这个字段，后端返回的datatype=0，也就是后端认为是string，也就是
 * 字符串类型，但是需求让显示成下拉框，也就是：
 * 1. 后端设定datatype=6，也就是前端的type=enum枚举型
 * 2. 前端将该类型写死为枚举型
 * 由于后端同事很难沟通，所以这里我们采用第二方案，由前端来写死了
 */
function fixDataTypes(baseDocId, {...field}) {
  // 后端虽然使用字符串类型，但是字符串有固定格式，
  // 后端文档针对accountproperty字段定义如下：
  // > BASE("基本"),NORMAL("一般"),TEMPORARY("临时"),SPECIAL("专用")
  //
  // 暂时禁用掉了，因为这个bug
  // http://172.16.50.197:8080/browse/YBZSAAS-106
  if (0 && baseDocId === 'bankaccount' && field.id === 'accountproperty') {
    field.datatype = 6; // 枚举型
    field.type = 'enum';
    field.data = [
      {key: 'BASE', value: '基本'},
      {key: 'NORMAL', value: '一般'},
      {key: 'TEMPORARY', value: '临时'},
      {key: 'SPECIAL', value: '专用'}
    ];
  }
  return field;
}

/**
 * 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
 */
function fixReferKey(field) {
  if (field.type !== 'ref') {
    return field;
  }
  field.refCode = field.refinfocode;
  return field;
}

/**
 * 根据参照的类型来添加参照的config object
 */
function setReferFields(field) {
  const getReferConfig = fieldDocType => {
    const config = {
      referConditions: {
        refCode: fieldDocType, // 'dept',
        refType: 'tree',
        rootName: '部门'
      }
    };
    if (fieldDocType === 'user') {
      config.referDataUrl = ReferUserDataURL;
    } else {
      config.referDataUrl = ReferDataURL;
    }
    return config;
  };
  if (field.type === 'ref') {
    field.referConfig = getReferConfig(field.refCode);
  }
  return field;
}

/**
 * 获取表格体数据(table body)，以及表格字段数据(table head)。
 */

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

/**
 * 获取表格体数据失败
 * @param {String} message 错误信息
 * @param {String} resBody 比如，可以是HTTP response body，也可以是其他说明信息
 *                         用来补充说明用的，因为message通常会很短
 * TODO: resBody不应该保存在adminAlert下，而是应该放在tableData下
 */
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

function deleteTableDataFail(message) {
  return {
    type: types.DELETE_TABLEDATA_FAIL,
    message
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

/**
 * 跳转到页
 */
export function gotoPage(startIndex, nextPage) {
  return (dispatch, getState) => {
    dispatch({
      type: types.GOTO_PAGE,
      startIndex,
      nextPage
    });
  }
}

// 这个接口只获取表格体的数据
export function fetchTableBodyData(baseDocId, itemsPerPage, startIndex, nextPage) {
  return (dispatch, getState) => {
    dispatch(requestTableData());
    const { arch } = getState();

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

/**
 * 复合操作：获取表格数据并将页码设定为下一页
 */
export function fetchTableBodyDataAndGotoPage(baseDocId, itemsPerPage, startIndex, nextPage) {
  return (dispatch, getState) => {
    return dispatch(fetchTableBodyData(baseDocId, itemsPerPage, startIndex))
      .then(() => {
        return dispatch(gotoPage(startIndex, nextPage));
      });
  };
}

/**
 * 获取表格的列模型
 */
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
            dispatch(receiveTableColumnsModelFail('后端返回的HTTP status code不是200', text));
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
          const [isValid, validationMessage] = validation.tableColumnsModelData(json);
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
              /* 1 */ .filter(shouldNotRemoveFields.bind(this, baseDocId))
              /* 2 */ .map(fixFieldTypo)
              /* 3 */ .map(convertDataType)
              /* 4 */ .map(setRequiredFields.bind(this, baseDocId))
              /* 5 */ .map(setHiddenFields)
              /* 6 */ .map(fixDataTypes.bind(this, baseDocId))
              /* 7 */ .map(fixReferKey)
              /* 8 */ .map(setReferFields);
            dispatch(receiveTableColumnsModelSuccess(json, fields));
          } else {
            dispatch(receiveTableColumnsModelFail(
              `虽然后端返回的success是true，而且客户端也获得到了JSON数据，
              但是数据校验方法提示说：“${validationMessage}”`,
              JSON.stringify(json.data, null, '  ')
            ));
          }

        } else {
          dispatch(receiveTableColumnsModelFail(
            '后端返回的success不是true', JSON.stringify(json, null, '  '))
          );
        }
      })
      .catch(function (err) {
        console.log("fetch table columns error:", err);
      });
  }
}

/**
 * 删除表格中的一行数据
 * @param {String} baseDocId 基础档案类型名称
 * @param {String} rowIdx 删除哪一行
 * @param {Object} rowData 被删除的行的数据对象
 */
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
         if( json.success ==  true ) {
           dispatch(deleteTableDataSuccess(json));
         }else{
           dispatch(deleteTableDataFail(json.message));
         }
      }).catch(function (err) {
        alert('删除时候出现错误');
        console.log("删除时候出现错误：", err);
      });
  }
}

/**
 * 创建和修改表格数据都会调用到这里
 * rowIdx是可选参数，只有当修改表格数据（也就是点击表格每行最右侧的编辑按钮）
 * 的时候才会传这个参数
 * @param {String} baseDocId 基础档案类型名称，比如dept
 * @param {Array} fields 字段定义
 * @param {Object} formData 表单提交的数据
 * @param {Number} rowIndex 只有是修改了某一个行，才会传数字，否则传null
 */
export function saveTableData(baseDocId, fields, formData, rowIdx) {
  return (dispatch, getState) => {
    var requestBodyObj = { ...formData };

    // 注意：处理是有顺序的，不要乱调整
    // 1. 存储在formData中的参照是对象，往后端传的时候需要取出refer.selected[0].id传给后端。
    requestBodyObj = processRefer(requestBodyObj, fields);
    // 2. 删除key:value中，当value为undefined/null
    requestBodyObj = removeEmpty(requestBodyObj);

    /**
     * 将formData中参照存储的复杂类型（包含id,code,name）转换成单值类型
     * ```json
     * {
     *   bumen: {
     *     id: '02EDD0F9-F384-43BF-9398-5E5781DAC5D0',
     *     code: '0502',
     *     name: '二车间'
     *   }
     * }
     * ```
     * 转换成
     * ```json
     * {
     *   bumen: '02EDD0F9-F384-43BF-9398-5E5781DAC5D0'
     * }
     * ```
     */
    function processRefer(obj, fields) {
      const newObj = { ...obj };
      fields.forEach(field => {
        if (field.type === 'ref') {
          var fieldId = field.id;
          var fieldObj = obj[fieldId];
          // 用户是否选择过参照
          if (fieldObj && fieldObj.id) {
            newObj[fieldId] = fieldObj.id;
          } else {
            newObj[fieldId] = null;
          }
        }
      });
      return newObj;
    }

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
      body: JSON.stringify(requestBodyObj)
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
 * 复合操作：创建/保存并刷新表格
 */
export function saveTableDataAndFetchTableBodyData(baseDocId, fields, formData, rowIdx, startIndex) {
  return (dispatch, getState) => {
    const { arch } = getState();
    return dispatch(saveTableData(baseDocId, fields, formData, rowIdx)).then(() => {
      return dispatch(fetchTableBodyData(baseDocId, arch.itemsPerPage, arch.startIndex));
    });
  };
}

/**
 * 复合操作：创建/保存并刷新表格
 */
export function deleteTableDataAndFetchTableBodyData(baseDocId, rowIdx, rowData, startIndex) {
  return (dispatch, getState) => {
    const { arch } = getState();
    return dispatch(deleteTableData(baseDocId, rowIdx, rowData)).then(() => {
      return dispatch(fetchTableBodyData(baseDocId, arch.itemsPerPage, arch.startIndex));
    });
  };
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
