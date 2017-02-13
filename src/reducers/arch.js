import update from 'react-addons-update';
import { combineReducers } from 'redux';

import {
  LOAD_TABLEDATA, LOAD_TABLEDATA_SUCCESS, LOAD_TABLEDATA_FAIL,
  CHANGE_SELECTED_ROWS,

  SHOW_EDIT_DIALOG, HIDE_EDIT_DIALOG,
  INIT_EDIT_FORM_DATA, UPDATE_EDIT_FORM_FIELD_VALUE,
  SUBMIT_EDIT_FORM, SUBMIT_EDIT_FORM_SUCCESS, SUBMIT_EDIT_FORM_FAIL,

  SHOW_CREATE_DIALOG, HIDE_CREATE_DIALOG,
  INIT_CREATE_FORM_DATA, UPDATE_CREATE_FORM_FIELD_VALUE,
  SUBMIT_CREATE_FORM, SUBMIT_CREATE_FORM_SUCCESS, SUBMIT_CREATE_FORM_FAIL,

  SHOW_ADMIN_ALERT, HIDE_ADMIN_ALERT
} from '../constants/ActionTypes';

const initState = {
  loaded: false,
  tableData: [],
  fields: [],
  totalDataCount: 0,
  selectedRows: {},
  editDialog: {
    show: false,
    formData: []
  },
  editFormData: [],
  createDialog: {
    show: false
  },
  createFormData: [],
  adminAlert: {
    show: false,
    error: {
      code: 0,
      bsStyle: 'danger',
      message: ''
    }
  }
};

export default function arch(state = initState, action) {
  switch (action.type) {

    // admin alert
    case SHOW_ADMIN_ALERT:
      return update(state, {
        adminAlert: {
          show: {$set: true}
        }
      });
    case HIDE_ADMIN_ALERT:
      return update(state, {
        adminAlert: {
          show: {$set: false}
        }
      });

    // table
    case LOAD_TABLEDATA:
      return {...state,
        loading: true
      };
    case LOAD_TABLEDATA_SUCCESS:
      return {...state,
        loading: false,
        loaded: true,
        tableData: action.data.items,
        fields: action.data.fields,
        totalDataCount: action.data.totalCount,
        totalPage: action.data.totalPage
      };
    case LOAD_TABLEDATA_FAIL:
      return {...state,
        loading: false,
        loaded: false,
        adminAlert: {...state.adminAlert,
          show: true,
          bsStyle: action.bsStyle,
          message: action.message
        }
      };
    case CHANGE_SELECTED_ROWS:
      return {...state,
        selectedRows: action.selectedRows
      }

    // edit dialog
    case SHOW_EDIT_DIALOG:
    case HIDE_EDIT_DIALOG:
      return {...state,
        editDialog: {
          show: action.openDialog,
          formData: action.formData
        },
        editFormData: action.formData
      }
    case UPDATE_EDIT_FORM_FIELD_VALUE:
      // Update single value inside specific array item
      // http://stackoverflow.com/questions/35628774/how-to-update-single-value-inside-specific-array-item-in-redux
      return update(state, { 
        editFormData: { 
          [action.id]: {
            value: {$set: action.payload}
          }
        }
      });
    case INIT_EDIT_FORM_DATA:
      return {...state,
        editFormData: action.editFormData
      }
    case SUBMIT_EDIT_FORM:
      return {...state,
        submitting: true
      };
    case SUBMIT_EDIT_FORM_SUCCESS:
      return {...state,
        submitting: false,
        submited: true,
        adminAlert: {...state.adminAlert,
          show: true,
          bsStyle: action.bsStyle,
          message: action.message
        }
      };
    case SUBMIT_EDIT_FORM_FAIL:
      return {...state,
        submitting: false,
        submitted: false,
        adminAlert: {...state.adminAlert,
          show: true,
          bsStyle: action.bsStyle,
          message: action.message
        }
      };

    // create dialog
    case SHOW_CREATE_DIALOG:
    case HIDE_CREATE_DIALOG:
      return {...state,
        createDialog: {
          show: action.openDialog,
          formData: action.formData
        },
        createFormData: action.formData
      }
    case UPDATE_CREATE_FORM_FIELD_VALUE:
      // Update single value inside specific array item
      // http://stackoverflow.com/questions/35628774/how-to-update-single-value-inside-specific-array-item-in-redux
      return update(state, {
        createFormData: {
          [action.id]: {
            value: {$set: action.payload}
          }
        }
      });
    case INIT_CREATE_FORM_DATA:
      return {...state,
        createFormData: action.formData
      }
    case SUBMIT_CREATE_FORM:
      return {...state,
        submitting: true
      };
    case SUBMIT_CREATE_FORM_SUCCESS:
      return {...state,
        submitting: false,
        submited: true,
        adminAlert: {...state.adminAlert,
          show: true,
          bsStyle: action.bsStyle,
          message: action.message
        }
      };
    case SUBMIT_CREATE_FORM_FAIL:
      return {...state,
        submitting: false,
        submitted: false,
        adminAlert: {...state.adminAlert,
          show: true,
          bsStyle: action.bsStyle,
          message: action.message
        }
      };

    default:
      return state;
  }
}
