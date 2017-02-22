const low = require('lowdb');
const utils = require('./utils');
const DB_TABLE = require('./db').db();

module.exports = {
  post: post
};

function post(req, res) {
  const doctype = req.body.doctype || 'dept';

  const resObj = {
    __fake_server__: true,
    success: true,
    message: null,
  };

  if (doctype === 'accbook') {
    const db = low(`${__dirname}/db_data/t_${doctype}.json`);
    resObj.data = db.value().head;
  } else {
    if (DB_TABLE[doctype]) {
      // 根据基础档案类型，获取数据库中对应表的所有数据
      var db_table = DB_TABLE[doctype]();
      resObj.data = db_table.head;
    } else {
      resObj.success = false;
      resObj.message = '未知的基础档案类型';
    }
  }

  res.json(resObj);
}
