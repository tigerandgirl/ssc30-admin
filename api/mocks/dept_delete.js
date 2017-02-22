const low = require('lowdb');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const db = low(`${__dirname}/db_data/t_dept.json`);
  const id = req.body.id;

  db.get('body')
    .remove({id: id})
    .write();

  const basedoc = {
    __fake_server__: true,
    "success": true,
    "message": `${id} 删除成功`
  };

  res.json(basedoc);
}
