# ssc_web-boilerplate

A boilerplate for creating ssc_web (SSC 3.0) sub-project 

## Prepare

```
npm install
```

## Run dev

```
npm run dev
```

Open http://127.0.0.1:3008/

## Development

## API

```
/api/v1/res/arch/grid
```

```
GET /api/v1/res/arch/grid?itemsPerPage=5&startIndex=1 HTTP/1.1
Host: 127.0.0.1:3008
```

## Mock API with swagger

Edit API with [Swagger Editor](http://editor.swagger.io/), and export to `ssc_web/src/admin/swagger/swagger.yaml`

Test API with cURL

```
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: 214c0fb1-7e45-91d2-99e5-083471febbe1" -d '{
  "pk_doctype": "string1",
  "condition": "string",
  "paras": [],
  "fields": [],
  "begin": 0,
  "max": 10
}' "http://localhost:3008/plat/basedoc/qrybd"
```

View generated API docs with Swagger UI: https://xxd3vin.github.io/swagger-ui/?url=https://xxd3vin.github.io/attachments/yonyou-ssc30/swagger-api.json

## JSON

```json
{
  "apiVersion": "1.0",
  "data": {
    "currentItemCount": 5,
    "itemsPerPage": 5,
    "startIndex": 1,
    "totalItems": 22,
    "items": [
      {
        "id": 0,
        "col1": "col1",
        "col2": "col2",
        "col3": "col3"
      },
      {
        "id": 1,
        "col1": "col1",
        "col2": "col2",
        "col3": "col3"
      },
      {
        "id": 2,
        "col1": "col1",
        "col2": "col2",
        "col3": "col3"
      },
      {
        "id": 3,
        "col1": "col1",
        "col2": "col2",
        "col3": "col3"
      },
      {
        "id": 4,
        "col1": "col1",
        "col2": "col2",
        "col3": "col3"
      }
    ]
  }
}
```

## React components tree

<pre>
ArchContainer
|-- Grid 布局
|   |-- Row
|   |   `-- Col
|   |       `-- AdminCardActions 数据操作按钮
|   `-- Row
|       `-- Col
|           `-- AdminTable 表格
|-- AdminEditDialog
|   `-- AdminEditForm 编辑表单
`-- AdminEditDialog
    `-- AdminEditForm 创建表单
</pre>

组件结构图

![](https://docs.google.com/drawings/d/1tDPkbnKg0LESWVVfw_bP96HA5pJObeLsaCRxSUEdUbo/pub?w=960&h=720)

## Components

### AdminEditForm

#### Actions



## redux state tree

### 档案管理

```json
{
  "arch": {
    "data": {
      "items": [
        {
          "id": '0',
          "col1": 'row1, col1',
          "col2": 'row1, col2',
          "cols": [
            { "type": 'text', label: 'col1', value: 'row1, col1' },
            { "type": 'text', label: 'col2', value: 'row1, col2' }
          ]
        },
        {
          "id": '1',
          "col1": 'row2, col1',
          "col2": 'row2, col2',
          "cols": [
            { type: 'text', label: 'col1', value: 'row2, col1' },
            { type: 'text', label: 'col2', value: 'row2, col2' }
          ]
        }
      ],
      "currentItemCount": null,
      "startIndex": null,
      "totleItems": null
    },
    "selectedRows": '',
    "editDialog": {
      show: false,
      rowId: 0,
      formData: [
        { type: 'text', label: 'col1', value: 'row1, col1' },
        { type: 'text', label: 'col2', value: 'row1, col2' }
      ]
    },
    editFormData: [
      { type: 'text', label: 'col1', value: 'row1, col1' },
      { type: 'text', label: 'col2', value: 'row1, col2' }
    ],
    submitting: false,
    submited: false,
    createDialog: {
      show: false
    },
    createFormData: [
      { type: 'text', label: 'col1', value: 'row1, col1' },
      { type: 'text', label: 'col2', value: 'row1, col2' }
    ]
    adminAlert: {
      show: false,
      error: {
        code: 0,
        message: ''
      }
    }
  }
}
```

### 角色管理

```json
{
  "arch": {
    "data": {
      "items": [
        {
          "id": '0',
          "col1": 'row1, col1',
          "col2": 'row1, col2',
          "cols": [
            { "type": 'text', label: 'col1', value: 'row1, col1' },
            { "type": 'text', label: 'col2', value: 'row1, col2' }
          ]
        },
        {
          "id": '1',
          "col1": 'row2, col1',
          "col2": 'row2, col2',
          "cols": [
            { type: 'text', label: 'col1', value: 'row2, col1' },
            { type: 'text', label: 'col2', value: 'row2, col2' }
          ]
        }
      ],
      "currentItemCount": null,
      "startIndex": null,
      "totleItems": null
    },
    "selectedRows": '',
    "editDialog": {
      show: false,
      rowId: 0,
      formData: [
        { type: 'text', label: 'col1', value: 'row1, col1' },
        { type: 'text', label: 'col2', value: 'row1, col2' }
      ]
    },
    editFormData: [
      { type: 'text', label: 'col1', value: 'row1, col1' },
      { type: 'text', label: 'col2', value: 'row1, col2' }
    ],
    submitting: false,
    submited: false,
    createDialog: {
      show: false
    },
    createFormData: [
      { type: 'text', label: 'col1', value: 'row1, col1' },
      { type: 'text', label: 'col2', value: 'row1, col2' }
    ]
    adminAlert: {
      show: false,
      error: {
        code: 0,
        message: ''
      }
    }
  }
}
```

## Demos

- AdminEditForm http://127.0.0.1:3008/admin/#/demo/form

## Naming rule

### user operations

- `Create`, `Add` - create or add new entries
- `Read`, `Retrieve`, `Search`, `View` - read, retrieve, search, or view existing entries
- `Update`, `Edit` - update or edit existing entries
- `Delete`, `Deactivate`, `Remove` - delete/deactivate/remove existing entries

### Action name

`<noun>-<verb>`，比如`Project-Create`, `User-Login`，这样以object type（而不是action type）进行分组。

https://medium.com/lexical-labs-engineering/redux-best-practices-64d59775802e#7f41

## 创建新页面的一般步骤

比如页面名称叫做“基础档案配置页面”，那么名称定为`ArchSetting`

1. 创建Container，位置`./containers/ArchSettingPage.js`
1. 创建Action，位置`./actions/archSetting.js`
1. 创建Action type，位置`./constants/ArchSettingActionTypes.js`
1. 创建Reducer，位置`./reducers/archSetting.js`
  - 并添加到`combineReducers()`中，位置`./reducers/index.js`
1. 添加到Sidebar中，位置`./components/Sidebar.js`
1. 添加到Router中，位置`./index.js`
1. 创建fake API，位置`../../app_admin.js`
  - 创建middleware，位置`../server/routes/fakeApiArchSetting.js`

## Redux actions and reducers

![Redux actions and reducers](https://docs.google.com/drawings/d/163ixocYs8FJHo4WalW_bsZWg0w3PwZfg7xrSDM8Kq_E/pub?w=960&h=720)

## 常用网址

- 内网测试地址 http://10.1.78.23:3008/admin
- 外网测试地址 http://101.200.74.182:3008/admin
- SSC 3.0 on Google Drive - https://drive.google.com/drive/folders/0B_RIK8efdyq-QUx6RG9yaVR2cjA?usp=sharing
- API文档 https://xxd3vin.github.io/swagger-ui/?url=https://xxd3vin.github.io/attachments/yonyou-ssc30/swagger-api.json

## ref

- https://github.com/marmelab/admin-on-rest 可以借鉴UI
- https://google.github.io/styleguide/jsoncstyleguide.xml 可以借鉴JSON API Design