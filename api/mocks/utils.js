"use strict";

module.exports = {
  row: row,
  pagination: pagination,
  makeid: makeid,
  string: $string,
  boolean: $boolean,
  ref: $ref,
  enum: $enum
};

function row(id, cols) {
  return {
    id: id,
    cols: cols.map(col => ({value: col}))
  };
}

function pagination(db_table, begin, itemPerPage) {
  let ret = [];
  let index = begin;
  for (; index < (begin + itemPerPage); index++) {
    if (!db_table.body[index]) continue;
    ret.push(db_table.body[index]);
  }
  return ret;
}

function makeid(length) {
  length = length || 5;
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// 字符
function $string(id, name, size) {
  size = size || 40;
  return {
    "id": id,
    "lable": name,
    "datatype": 0,
    "length": size
  };
}

// 布尔
function $boolean(id, name) {
  return {
    "id": id,
    "lable": name,
    "datatype": 4
  };
}

// 参照
function $ref(id, name) {
  return {
    "id": id,
    "lable": name,
    "datatype": 999,
    refinfo: "G001ZM0000BASEDOC0000DEPT000000000000000"
  };
}

// 枚举
function $enum(id, name) {
  return {
    "id": id,
    "lable": name,
    "datatype": 6,
    "data": [
      {
        "key": "male",
        "value": "男"
      },
      {
        "key": "female",
        "value": "女"
      }
    ]
  };
}
