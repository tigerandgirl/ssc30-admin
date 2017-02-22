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
  const itemsPerPage = req.body.groupnum; // 每页显示数量

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
    resObj.data = db_table.body.slice(begin, begin + itemsPerPage);
    resObj.begin = begin;
    resObj.num = itemsPerPage;
    resObj.totalnum = db_table.body.length;
  } else {
    resObj.success = false;
    resObj.message = '未知的基础档案类型';
  }

  res.json(resObj);
}
