const low = require('lowdb');
const utils = require('./utils');

module.exports = {
  post: post
};

function post(req, res) {
  const db = low(`${__dirname}/db_data/t_dept.json`);
  const data = req.body;

  const resObj = {
    __fake_server__: true,
    success: true
  };

  if (data.id) {
    db.get('body')
      .find({id: data.id})
      .assign(data)
      .write();
    resObj.data = data;

    resObj.message = `保存成功：res.data.id = ${data.id}`;
  } else {
    const newData = Object.assign({id: utils.makeid(40)}, data);
    db.get('body')
      .push(newData)
      .write();
    resObj.data = newData;

    resObj.message = `创建成功，新数据的主键：${newData.id}`;
  }

  res.json(resObj);
}
