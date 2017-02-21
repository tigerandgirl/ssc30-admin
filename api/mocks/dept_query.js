const util = require('util');
const utils = require('./utils');
const DB_TABLE = require('./db').db();

module.exports = {
  post: post
};

function post(req, res) {
  const doctype = 'dept';

  const condition = req.body.condition || '';
  const begin = req.body.begin;
  const groupnum = req.body.groupnum; // 每页显示数量

  const resObj = {
    __fake_server__: true,
    "success": true,
    "message": null,
  };

  if (DB_TABLE[doctype]) {
    // 根据基础档案类型，获取数据库中对应表的所有数据
    var db_table = DB_TABLE[doctype]();
    // 通过工具函数对所有数据进行分页，获取单页数据
    // 由于数据库结构和后端定义的response结构不同，这里处理transform
    resObj.data = utils.pagination(db_table, begin, groupnum).map(function (dbRow) {
      const row = {};
      db_table.head.forEach(function (fieldItem, columnIdx) {
        row[fieldItem.id] = dbRow.cols[columnIdx].value;
      })
      return row;
    });
    resObj.begin = begin;
    resObj.num = groupnum;
    resObj.totalnum = db_table.body.length;
  } else {
    resObj.success = false;
    resObj.message = '未知的基础档案类型';
  }

  res.json(resObj);
}

/*
    "fields": [
      {
        "key": "string",
        "lable": "字符",
        "datatype": 0,
        "length": 40
      },
      {
        "key": "integer",
        "lable": "整型",
        "datatype": 1
      },
      {
        "key": "double",
        "lable": "数字",
        "datatype": 2,
        "length": 28,
        "digit": 8
      },
      {
        "key": "date",
        "lable": "日期",
        "datatype": 3
      },
      {
        "key": "datetime",
        "lable": "时间",
        "datatype": 8
      },
      {
        "key": "boolean",
        "lable": "布尔",
        "datatype": 4
      },
      {
        "key": "enum",
        "lable": "枚举",
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
      },
      {
        "key": "ref",
        "lable": "参照",
        "datatype": 5,
        "refinfo": "G001ZM0000BASEDOC0000DEPT000000000000000"
      },
      {
        "key": "text",
        "lable": "文本域",
        "datatype": 9,
        "length": 4000
      }
    ],
*/
