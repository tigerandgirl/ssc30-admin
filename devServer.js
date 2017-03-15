/* eslint-disable no-console, no-process-exit */

const path = require('path');

// HTTP server for local development
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
// const multer = require('multer');

// Webpack for local development
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

// Webpack config for local development
const config = require('./webpack.config.dev');

// Create a Express server, enable middlewares
const app = express();
app.use(compression());
// 反向代理中间件需要在body-parser之前处理请求，否则会导致请求hang up
app.use(require('./server/routes/aliyun')());
// Parsing content-type: application/json
app.use(bodyParser.json());
// Parsing content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// Parsing content-type: multipart/form-data
// var upload = multer();

const compiler = webpack(config);
app.use(webpackMiddleware(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));
app.use(webpackHotMiddleware(compiler));

app.use('/', express.static(path.join(__dirname + '/client')));
app.use('/swagger/basedoc.yaml',
  express.static(path.join(__dirname, 'src', 'swagger', 'basedoc.yaml')));

app.use(require('./server/routes/fakeApiArch')());
app.use(require('./server/routes/fakeApiRole')());
app.use(require('./server/routes/fakeApiPermission')());
app.use(require('./server/routes/fakeApiArchSetting')());
app.use(require('./server/routes/fakeApiNCSync')());

// Create a mock API with swagger

const SwaggerExpress = require('swagger-express-mw');

const swaggerConfig = {
  // Runner props
  // swagger: 'src/swagger/swagger.yaml', // 全部API
  swagger: 'src/swagger/basedoc.yaml', // 仅有基础档案API
  // config props
  appRoot: __dirname,  // required config
  configDir: 'src/swagger', // TODO: should move to src/api/swagger
  mockControllersDirs: 'src/api/mocks' // TODO: config not work for swagger-node-runner
};

SwaggerExpress.create(swaggerConfig, (err, swaggerExpress) => {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
});

const port = process.env.PORT || 3008;
const ip = process.env.IP || '127.0.0.1';

app.listen(port, ip, err => {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://%s:%s', ip, port);
  console.log('webpack is building now, please wait...');
});
