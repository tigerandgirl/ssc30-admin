import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Import the stylesheet you want used! Here we just reference
 * the main SCSS file we have in the styles directory.
 */
//import './styles/main.scss';
import './styles/ssc-grid.css';
import './styles/ssc-grid2.css';

// 引入图片资源
import './assets/screenshot_20170224_011.jpg';

/**
 * Both configureStore and Root are required conditionally.
 * See configureStore.js and Root.js for more details.
 */
import { configureStore } from './store/configureStore';
import { Root } from './containers/Root';

const store = configureStore();

ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
);
