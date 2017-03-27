import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import * as ActionTypes from '../actions/entityMap';

const initState = {
  loading: false,
  loaded: false,
  treeData: [],
  // 右表表头和表体
  entityFieldsModelloading: false,
  entityFieldsModelloaded: false,
  entityFieldsModel: [], // 表单/表格字段模型
  entityTableBodyData: [], // 表体数据
  selectedNodeData: {}, // 被选中的左侧的节点信息
  // 创建对话框
  createDialog: {
    show: false
  },
  // 编辑对话框
  editDialog: {
    show: false,
    rowIdx: null // 当前编辑框对应表格的行index
  },
  editFormData: {},
  // 页面上的错误提示
  adminAlert: {
    show: false,
    error: {
      code: 0,
      bsStyle: 'danger', // one of: "success", "warning", "danger", "info"
      message: '',
      resBody: '' // 需要改成details，因为这里不仅仅会填写response body
    }
  },
  // 当表单提交失败的时候，在对话框中显示错误提示
  formAlert: {
    show: false,
    error: {
      code: 0,
      bsStyle: 'danger', // one of: "success", "warning", "danger", "info"
      message: ''
    }
  }
};

// Show case for redux-actions
export default handleActions({

  // 获取三层数据

  [ActionTypes.TEMPLATE_REQUEST]: (state, action) => ({...state,
    loading: true
  }),
  [ActionTypes.TEMPLATE_SUCCESS]: (state, action) => ({...state,
    loading: false,
    loaded: true,
    treeData: [...action.payload.data]
  }),
  [ActionTypes.TEMPLATE_FAILURE]: (state, action) => ({...state,
    loading: false,
    loaded: false,
    adminAlert: {...state.adminAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  }),

  /**
   * 更新树
   */

  [ActionTypes.TEMPLATE_TREE_DATA_UPDATE]: (state, action) => ({...state,
    treeData: [...action.treeData]
  }),

  /**
   * 更新指定节点下的子节点
   */

  [ActionTypes.TEMPLATE_NODE_REQUEST]: (state, action) => ({...state,
    loading: true
  }),
  [ActionTypes.TEMPLATE_NODE_SUCCESS]: (state, action) => ({...state,
    loading: false,
    loaded: true,
    treeData: [...action.payload.treeData]
  }),
  [ActionTypes.TEMPLATE_NODE_FAILURE]: (state, action) => ({...state,
    loading: false,
    loaded: false,
    adminAlert: {...state.adminAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  }),

  /**
   * 右表的字段模型和表体数据
   */
  [ActionTypes.ENTITY_FIELDS_MODEL_REQUEST]: (state, action) => ({...state,
    entityFieldsModelloading: true
  }),
  [ActionTypes.ENTITY_FIELDS_MODEL_SUCCESS]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: true,
    entityFieldsModel: [...action.payload.fieldsModel],
    entityTableBodyData: [...action.payload.tableBodyData],
    selectedNodeData: {...action.payload.nodeData}
  }),
  [ActionTypes.ENTITY_FIELDS_MODEL_FAILURE]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: false,
    adminAlert: {...state.adminAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  }),

  /**
   * 带表单的编辑对话框
   */

  [ActionTypes.ENTITY_MAP_EDIT_DIALOG_SHOW]: (state, action) => ({...state,
    editDialog: {
      show: action.show,
      rowIdx: action.rowIdx
    },
    editFormData: action.editFormData
  }),

  /**
   * 带表单的创建对话框
   */

  [ActionTypes.ENTITY_MAP_CREATE_DIALOG_SHOW]: (state, action) => ({...state,
    editDialog: {
      show: action.show
    },
    createFormData: action.formData
  })

}, initState);
