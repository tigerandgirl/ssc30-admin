module.exports = {
  row: row,
  string: $string,
  boolean: $boolean,
  ref: $ref,
  enum: $enum
};

function row(id, cols) {
  return {
    id: id,
    cols: cols.map(col => ({value: col}))
  };
}

function $string(name) {
  return {
    "id": "string",
    "lable": name,
    "datatype": 0,
    "length": 40
  };
}

function $boolean(name) {
  return {
    "id": "boolean",
    "lable": name,
    "datatype": 4
  };
}

function $ref(name) {
  return {
    "id": "ref",
    "lable": name,
    "datatype": 999,
    refinfo: "G001ZM0000BASEDOC0000DEPT000000000000000"
  };
}

function $enum(name) {
  return {
    "id": "enum",
    "lable": name,
    "datatype": 6,
    "data": [
      {
        "key": "male",
        "value": "男"
      },
      {
        "key": "female",
        "value": "女"
      }
    ]
  };
}
