// 批量生成所有接口文档
// 使用方法： node init.js
// 然后将输出到命令行的yaml字符串复制到basedoc.yaml中

const getBaseDocTypes = require('../../src/constants/BaseDocTypes');

getBaseDocTypes().forEach(function (o) {
  console.log(tpl(o.id, o.name));
});

// id: dept
// name: 部门
function tpl(id, name) {
  if (id === 'dept') {
    // query
    var query_controller = 'dept_query';
    var query_request_model = 'DeptQueryReqModel';
    var query_response_model = 'SuccessModel';

    // delete
    var delete_controller = 'dept_delete';
    var delete_request_model = 'DeptDeleteReqModel';
    var delete_response_model = 'CommonDeleteSuccessModel';

    // save
    var save_controller = 'dept_save';
    var save_request_model = 'DeptSaveReqModel';
    var save_response_model = 'DeptSaveSuccessModel';

  } else {
    // query
    var query_controller = 'common_query';
    var query_request_model = 'CommonQueryReqModel';
    var query_response_model = 'CommonSuccessModel';

    // delete
    var delete_controller = 'common_delete';
    var delete_request_model = 'CommonDeleteReqModel';
    var delete_response_model = 'CommonDeleteSuccessModel';

    // save
    var save_controller = 'common_save';
    var save_request_model = 'CommonSaveReqModel';
    var save_response_model = 'CommonSaveSuccessModel';
  }

  return `
  /${id}/query:
    x-swagger-router-controller: ${query_controller}
    post:
      description: ${name}查询接口
      tags:
        - ${name}
      consumes:
      - application/json
      produces:
      - application/json
      parameters:
        - required: true
          name: body
          in: body
          description: 查询条件
          schema:
            $ref: '#/definitions/${query_request_model}'
      responses:
        '200':
          description: Success
          schema:
            $ref: '#/definitions/${query_response_model}'
        '404':
          description: Not Found
  /${id}/delete:
    x-swagger-router-controller: ${delete_controller}
    post:
      description: ${name}删除接口
      tags:
        - ${name}
      consumes:
      - application/json
      produces:
      - application/json
      parameters:
        - required: true
          name: body
          in: body
          description: ${name}主键
          schema:
            $ref: '#/definitions/${delete_request_model}'
      responses:
        '200':
          description: Success
          schema:
            $ref: '#/definitions/${delete_response_model}'
        '404':
          description: Not Found
  /${id}/save:
    x-swagger-router-controller: ${save_controller}
    post:
      description: ${name}修改接口
      tags:
        - ${name}
      consumes:
      - application/json
      produces:
      - application/json
      parameters:
        - required: true
          name: body
          in: body
          description: ${name}新数据
          schema:
            $ref: '#/definitions/${save_request_model}'
      responses:
        '200':
          description: Success
          schema:
            $ref: '#/definitions/${save_response_model}'
        '404':
          description: Not Found`;
}
