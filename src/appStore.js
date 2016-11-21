import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import loggerMiddleware from 'redux-logger';
import rootReducer from './reducers';
import promiseMiddleware from './promiseMiddleware';
import callAPIMiddleware from './callAPIMiddleware';

const logger = loggerMiddleware({
    predicate: (getState, action) => true, // log all actions
    level: `info`,
    duration: true,
    actionTransformer: (action) => {
        return {
            ...action,
            type: String(action.type || action.types)
        };
    }
});

const finalCreateStore = compose(
  applyMiddleware(thunkMiddleware, logger, promiseMiddleware,
    callAPIMiddleware
  ),

  // Setup dev tools - start
  // vanilla Redux DevTools
  //DevTools.instrument()
  // zalmoxisus Redux DevTools Extension
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  // Setup dev tools - end
)(createStore);

export default function appStore(initialState = {}) {
  const store = finalCreateStore(rootReducer, initialState);

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
