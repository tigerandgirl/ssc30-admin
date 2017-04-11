/**
 * 根据环境变量判断是否为生产环境，然后加载不同的后端服务器的IP和端口
 */

let loadedModule = null;

if (process.env.NODE_ENV === 'production') {
  loadedModule = require('./URLs.prod.js');
} else {
  loadedModule = require('./URLs.dev.js');
}

export default loadedModule;
