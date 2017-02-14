const util = require('util');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const data = req.body;

  const resObj = {
    __fake_server__: true,
    success: true,
    data: data
  };

  if (data.id) {
    resObj.message = `保存成功：res.data.id = ${data.id}`;
  } else {
    const primaryKey = utils.makeid(40);
    resObj.message = `创建成功，新数据的主键：${primaryKey}`;
    resObj.data.id = primaryKey;
  }

  res.json(resObj);
}
