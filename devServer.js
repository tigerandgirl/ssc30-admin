const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack.config.dev');
const bodyParser = require('body-parser');
//const multer = require('multer');

const app = express();
const compiler = webpack(config);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//var upload = multer(); // for parsing multipart/form-data

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler));
app.use('/', express.static(path.join(__dirname + '/client')));

// Create a mock API with swagger

const SwaggerExpress = require('swagger-express-mw');
//var app = require('express')();
//module.exports = app; // for testing

const swaggerConfig = {
  appRoot: __dirname,  // required config
  configDir: 'src/swagger',
  swagger: 'src/swagger/swagger.yaml'
};

SwaggerExpress.create(swaggerConfig, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
});

const port = process.env.PORT || 3008;
const ip = process.env.IP || '127.0.0.1';

app.listen(port, ip, function (err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://%s:%s', ip, port);
  console.log('webpack is building now, please wait...');
});
