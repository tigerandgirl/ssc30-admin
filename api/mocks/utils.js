module.exports = {
  row: row,
  string: $string,
  boolean: $boolean,
  dangan: $dangan
};

function row(id, cols) {
  return {
    id: id,
    cols: cols.map(col => ({value: col}))
  };
}

function $string(name) {
  return {
    "key": "string",
    "lable": name,
    "datatype": 0,
    "length": 40
  };
}

function $boolean(name) {
  return {
    "key": "boolean",
    "lable": name,
    "datatype": 4
  };
}

// 后端没有定义档案类型，所以这个结构是从string复制过来的。
function $dangan(name) {
  return {
    "key": "dangan",
    "lable": name,
    "datatype": 999,
    "length": 40
  };
}
