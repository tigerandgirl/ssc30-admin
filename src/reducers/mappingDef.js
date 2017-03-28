import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import * as ActionTypes from '../actions/mappingDef';

const initState = {
  // 表头
  tableColumnsModelloading: false,
  tableColumnsModelloaded: false,
  tableColumnsModel: [], // 表格/表单字段模型
  // 表体
  loading: false,
  loaded: false,
  tableBodyData: [],
  // 分页
  itemsPerPage: 15, // TODO 常量不应该放在这里
  startIndex: 0,
  activePage: 1,
  // 错误提示
  pageAlert: {
    show: false,
    error: {
      code: 0,
      bsStyle: 'danger', // one of: "success", "warning", "danger", "info"
      message: '',
      resBody: '' // 需要改成details，因为这里不仅仅会填写response body
    }
  },
  serverMessage: ''
};

// Show case for redux-actions
export default handleActions({

  // 获得表体数据

  [ActionTypes.CONVERSION_RULE_DEFINITION_REQUEST]: (state) => ({...state,
    loading: true
  }),
  [ActionTypes.CONVERSION_RULE_DEFINITION_SUCCESS]: (state, action) => ({...state,
    loading: false,
    loaded: true,
    tableBodyData: [...action.payload.data.data]
  }),
  [ActionTypes.CONVERSION_RULE_DEFINITION_FAILURE]: (state, action) => ({...state,
    loading: false,
    loaded: false,
    pageAlert: {...state.pageAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  }),

  [ActionTypes.TABLE_COLUMNS_MODEL_REQUEST]: (state) => ({...state,
    tableColumnsModelloading: true
  }),
  [ActionTypes.TABLE_COLUMNS_MODEL_SUCCESS]: (state, action) => ({...state,
    tableColumnsModelloading: false,
    tableColumnsModelloaded: true,
    tableColumnsModel: [...action.payload.data]
  }),
  [ActionTypes.TABLE_COLUMNS_MODEL_FAILURE]: (state, action) => ({...state,
    tableColumnsModelloading: false,
    tableColumnsModelloaded: false,
    pageAlert: {...state.pageAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  }),

  /**
   * 用于显示错误的tooltip
   */

  [ActionTypes.SHOW_PAGE_ALERT]: (state, action) => update(state, {
    pageAlert: {
      show: {$set: action.show}
    }
  })

}, initState);
