/**
 * 友账表
 */

import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Import the stylesheet you want used! Here we just reference
 * the main SCSS file we have in the styles directory.
 */
// import './styles/main.scss';
//import './styles/ssc-grid.css';
//import './styles/ssc-grid2.less';
// 参照组件样式
import './styles/refer/referStyle.css';

/**
 * 在这里引用友报账的样式文件
 */
import './styles/yzb.less';

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
