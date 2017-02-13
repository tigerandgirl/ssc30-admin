const util = require('util');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const head = req.body.data.head;

  const response = {
    "success": true,
    "message": `${head.id} ` + (head.id ? '保存' : '创建') + '成功';
  };

  res.json(response);
}
