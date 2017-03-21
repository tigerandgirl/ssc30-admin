import update from 'react-addons-update';
import { combineReducers } from 'redux';
import { handleActions } from 'redux-actions';

import * as ActionTypes from '../actions/conversionRuleDefinition';

const initState = {
  loading: false,
  loaded: false,
  columnsModel: [],
  tableData: []
};

// Show case for redux-actions
export default handleActions({

  // Fetch nc sync data, fill in the table
  [ActionTypes.CONVERSION_RULE_DEFINITION_REQUEST]: (state, action) => ({...state,
    loading: true
  }),
  [ActionTypes.CONVERSION_RULE_DEFINITION_SUCCESS]: (state, action) => ({...state,
    loading: false,
    loaded: true,
    tableData: [...action.payload.data]
  }),
  [ActionTypes.CONVERSION_RULE_DEFINITION_FAILURE]: (state, action) => ({...state,
    loading: false,
    loaded: false,
    adminAlert: {...state.adminAlert,
      show: true,
      bsStyle: action.payload.bsStyle,
      message: action.payload.message
    }
  })

}, initState);
