import fetch from 'isomorphic-fetch';
import { createAction } from 'redux-actions';

// Common helper -> utils.js/api.js
const checkStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
};
const parseJSON = response => response.json();

// NC sync config: fetch data

export const BAOZHANGREN_CAIWUZUZHI_TREE_REQUEST = 'BAOZHANGREN_CAIWUZUZHI_TREE_REQUEST';
export const BAOZHANGREN_CAIWUZUZHI_TREE_SUCCESS = 'BAOZHANGREN_CAIWUZUZHI_TREE_SUCCESS';
export const BAOZHANGREN_CAIWUZUZHI_TREE_FAILURE = 'BAOZHANGREN_CAIWUZUZHI_TREE_FAILURE';

const configRequest = createAction(BAOZHANGREN_CAIWUZUZHI_TREE_REQUEST);
const configSuccess = createAction(BAOZHANGREN_CAIWUZUZHI_TREE_SUCCESS, data => data);
const configFailure = createAction(BAOZHANGREN_CAIWUZUZHI_TREE_FAILURE,
  (bsStyle, message) => ({bsStyle, message})
);

export const fetchConfigData = () => {
  return (dispatch) => {
    dispatch(configRequest());
    var opts = {
      method: 'get',
      headers: {
        'Content-type': 'application/json'
      },
      mode: "cors"
    };

    //var url = '/api/caiwuzuzhi/tree';
    var url = 'http://101.200.74.182:82/caiwuzuzhi/tree.json';

    return fetch(url, opts)
      .then(response => {
        return response.json();
      }).then(json => {
        dispatch(configSuccess(json));
      }).catch(error => {
        console.log("fetch error:", error);
        dispatch(configFailure('danger', error.message));
      });
  }
}

// obsolete
export const BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_KEYS_CHANGED = 'BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_KEYS_CHANGED';
const checkedKeysChanged = createAction(BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_KEYS_CHANGED, data => data);
export const changeCheckedKeys = checkedKeys => dispatch => dispatch(checkedKeysChanged(checkedKeys))

export const BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_ITEMS_CHANGED = 'BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_ITEMS_CHANGED';
const checkedItemChanged = createAction(BAOZHANGREN_CAIWUZUZHI_TREE_CHECKED_ITEMS_CHANGED, data => data);
export const changeCheckedItems = checkedItem => dispatch => dispatch(checkedItemChanged(checkedItem))