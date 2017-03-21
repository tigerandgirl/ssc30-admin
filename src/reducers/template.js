import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import * as ActionTypes from '../actions/template';

const initState = {
  loading: false,
  loaded: false,
  treeData: []
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
  })

}, initState);
