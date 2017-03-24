/**
 * 常用的helper function
 */

// Common helper -> utils.js/api.js
export function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
}

export function parseJSON(response) {
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
export const removeEmpty = (obj) => {
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
export function fixFieldTypo ({...field}) {
  field.label = field.lable; // API中将label错误的写成了lable
  field.key = field.id; // API后来将key改成了id
  return field;
}

/**
 * 将后端使用数字表示的data type转换成前端的名称
 * 后端使用datatype=0, 前端使用type='string'
 */
export function convertDataType({...field}) {
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
export function setRequiredFields(baseDocId, {...field}) {
  const data = {
    dept: {
      code: true, // dept的code字段是必输字段
      name: true,
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
      defaultaccount: false,
      accountproperty: true
    },
    feeitemclass:{
      code:true ,
      name :true
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
export function shouldNotRemoveFields(baseDocId, {...field}) {
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
      bank: true,
      description: true,
      accounttype:true
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
export function setHiddenFields({...field}) {
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
export function fixDataTypes(baseDocId, {...field}) {
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
 * 后端返回的保存枚举的数据结构和前端不同，需要适配一下
 * 后端给的结构，array不像array，object不像object的
 * ```json
 * {
 *   enumdata: [
 *     {BASE: '基本'},
 *     {NORMAL: '一般'}
 *   ]
 * }
 * ```
 */
export function fixEnumData({...field}) {
  if (field.type === 'enum') {
    field.data = [];
    field.enumdata.forEach(item => {
      let key = Object.keys(item)[0];
      field.data.push({
        key,
        value: item[key]
      });
    })
  }
  return field;
}

/**
 * 根据参照的类型来添加参照的config object
 * TODO 需要转移到utils.js中
 */
export function setReferFields(ReferDataURL, ReferUserDataURL, field) {
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
 * 参照字段，后端传来的是refinfocode，但是前端Refer组件使用的是refCode
 */
export function fixReferKey(field) {
  if (field.type !== 'ref') {
    return field;
  }
  field.refCode = field.refinfocode;
  return field;
}

/**
 * 对后端生成的JSON做校验
 * 这里假设JSON本身是valid，但是需要再次确认业务层如何看待这些数据是否为valid
 */
export const validation = {
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
