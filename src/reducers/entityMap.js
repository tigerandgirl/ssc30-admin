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
  // 被选中的左侧的节点信息，这是一个复杂对象，是将后端的节点数据全部保存在这里
  // 了以方便向后端发请求时候需要传递这些参照，直接取用即可。
  selectedTreeNodeData: {},
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
  pageAlert: {
    show: false,
    bsStyle: 'danger', // one of: "success", "warning", "danger", "info"
    message: ''
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

  [ActionTypes.LEFT_TREE_REQUEST]: (state, action) => ({...state,
    loading: true
  }),
  [ActionTypes.LEFT_TREE_SUCCESS]: (state, action) => ({...state,
    loading: false,
    loaded: true,
    treeData: [...action.payload.data]
  }),
  [ActionTypes.LEFT_TREE_FAILURE]: (state, action) => ({...state,
    loading: false,
    loaded: false,
    pageAlert: {...state.pageAlert,
      show: true,
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
    pageAlert: {...state.pageAlert,
      show: true,
      message: action.payload.message
    }
  }),

  /**
   * 右表的字段模型和表体数据
   */
  [ActionTypes.ENTITY_TREE_NODE_DATA_REQUEST]: (state, action) => ({...state,
    entityFieldsModelloading: true
  }),
  [ActionTypes.ENTITY_TREE_NODE_DATA_SUCCESS]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: true,
    entityFieldsModel: [...action.payload.fieldsModel],
    entityTableBodyData: [...action.payload.tableBodyData],
    selectedTreeNodeData: {...action.payload.treeNodeData}
  }),
  [ActionTypes.ENTITY_TREE_NODE_DATA_FAILURE]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: false,
    pageAlert: {...state.pageAlert,
      show: true,
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
    createDialog: {
      show: action.show
    },
    createFormData: action.formData
  }),

  /**
   * 右侧表格的操作
   */

  // 添加
  [ActionTypes.TREE_NODE_DATA_ADD_REQUEST]: (state, action) => ({...state,
    treeNodeDataLoading: true
  }),
  [ActionTypes.TREE_NODE_DATA_ADD_SUCCESS]: (state, action) => ({...state,
    treeNodeDataLoading: false,
    treeNodeDataLoaded: true,
  }),
  [ActionTypes.TREE_NODE_DATA_ADD_FAILURE]: (state, action) => update(state, {
    treeNodeDataLoading: {$set: false},
    treeNodeDataLoaded: {$set: false},
    pageAlert: {
      show: {$set: true},
      message: {$set: action.payload.message}
    }
  }),
  // 修改
  [ActionTypes.TREE_NODE_DATA_UPDATE_REQUEST]: (state, action) => ({...state,
    treeNodeDataLoading: true
  }),
  [ActionTypes.TREE_NODE_DATA_UPDATE_SUCCESS]: (state, action) => ({...state,
    treeNodeDataLoading: false,
    treeNodeDataLoaded: true,
  }),
  [ActionTypes.TREE_NODE_DATA_UPDATE_FAILURE]: (state, action) => update(state, {
    treeNodeDataLoading: {$set: false},
    treeNodeDataLoaded: {$set: false},
    pageAlert: {
      show: {$set: true},
      message: {$set: action.payload.message}
    }
  }),
  // 删除
  [ActionTypes.TREE_NODE_DATA_DEL_REQUEST]: (state, action) => ({...state,
    treeNodeDataLoading: true
  }),
  [ActionTypes.TREE_NODE_DATA_DEL_SUCCESS]: (state, action) => ({...state,
    treeNodeDataLoading: false,
    treeNodeDataLoaded: true,
  }),
  [ActionTypes.TREE_NODE_DATA_DEL_FAILURE]: (state, action) => update(state, {
    treeNodeDataLoading: {$set: false},
    treeNodeDataLoaded: {$set: false},
    pageAlert: {
      show: {$set: true},
      message: {$set: action.payload.message}
    }
  }),

  /**
   * 对话框
   */

  [ActionTypes.PAGE_ALERT_SHOW]: (state, action) => update(state, {
    pageAlert: {
      show: {$set: action.show},
      message: {$set: action.message}
    }
  }),
  [ActionTypes.FORM_ALERT_SHOW]: (state, action) => update(state, {
    formAlert: {
      show: {$set: action.show},
      message: {$set: action.message}
    }
  })

}, initState);
