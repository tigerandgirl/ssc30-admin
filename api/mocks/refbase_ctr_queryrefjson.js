const debug = require('debug')('ssc:mocks');
const low = require('lowdb');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const refCode = req.body.refCode;
  const refType = req.body.refType;
  const rootName = req.body.rootName;

  const doctype = refCode;

  const resObj = {
    __fake_server__: true,
    "success": true,
    "message": null,
  };

const resObj2 = {
  "data": [
    {
      "id": "E6CB6CBE-C701-48EC-A3EB-C823DF8DBEED",
      "isLeaf": "true",
      "name": "服务中心",
      "pid": "FBA1DBB5-24A2-4A78-A4D5-453F7CC46AA6",
      "code": "02"
    },
    {
      "id": "FBA1DBB5-24A2-4A78-A4D5-453F7CC46AA6",
      "isLeaf": "false",
      "name": "测试部",
      "pid": "",
      "code": "03"
    }
  ]
};

  // 根据基础档案类型，获取数据库中对应表的所有数据
  debug(`Open database file: t_${doctype}.json`);
  const db = low(`${__dirname}/db_data/t_${doctype}.json`);

  // 为啥isEmpty返回的是Boolean对象?
  if (!db.isEmpty().valueOf()) {
    var body = db.get('body').value();
    debug('body: %s', JSON.stringify(body));
    // 对整个表数据进行分页，获取单页数据
    // TODO 由于数据库结构和后端定义的response结构不同，这里处理transform
    resObj.data = body.slice(begin, begin + itemsPerPage);
    resObj.begin = begin;
    resObj.num = itemsPerPage;
    resObj.totalnum = body.length; // 表的总行数
  } else {
    resObj.success = false;
    resObj.message = '对应该类型的数据表JSON文件不存在，请检查api/mocks/db_data/目录';
  }

  res.json(resObj2);
}
