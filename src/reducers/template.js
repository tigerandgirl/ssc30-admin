import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import * as ActionTypes from '../actions/template';

const initState = {
  loading: false,
  loaded: false,
  treeData: [],
  // 表头
  entityFieldsModelloading: false,
  entityFieldsModelloaded: false,
  entityFieldsModel: [] // 表格/表单字段模型
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
   * 获取实体的字段定义
   */
  [ActionTypes.ENTITY_FIELDS_MODEL_REQUEST]: (state, action) => ({...state,
    entityFieldsModelloading: true
  }),
  [ActionTypes.ENTITY_FIELDS_MODEL_SUCCESS]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: true,
    entityFieldsModel: [...action.payload.data]
  }),
  [ActionTypes.ENTITY_FIELDS_MODEL_FAILURE]: (state, action) => ({...state,
    entityFieldsModelloading: false,
    entityFieldsModelloaded: false,
    adminAlert: {...state.adminAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  })

}, initState);
