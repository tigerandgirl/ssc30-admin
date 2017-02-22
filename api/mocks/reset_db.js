const low = require('lowdb');
const utils = require('./utils');

// 重置数据库表
const tables = ['dept'];
tables.forEach(tableName => {
  // 从t_dept_init.json读出默认数据，写入t_dept.json中
  var db = low(`${__dirname}/db_data/t_${tableName}_init.json`);
  db.write(`${__dirname}/db_data/t_${tableName}.json`);
});
