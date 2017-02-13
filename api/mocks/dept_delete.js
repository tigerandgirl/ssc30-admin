const util = require('util');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const id = req.body.id;

  const basedoc = {
    "success": true,
    "message": `${id} 删除成功`
  };

  res.json(basedoc);
}
