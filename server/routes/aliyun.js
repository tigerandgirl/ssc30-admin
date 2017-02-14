/*jslint node:true */

'use strict';

const express = require('express');
const httpProxy = require('http-proxy');
const router = express.Router();
const proxy = httpProxy.createProxyServer();

const aliyunIP = '59.110.123.20';
//const aliyunIP = '127.0.0.1:8000';

module.exports = function () {
  var aliyunBackend = {
    target: `http://${aliyunIP}`
  };
  console.log(aliyunBackend);
  router.all("/ficloud/*", function(req, res) {
    console.log('redirecting to aliyun');
    proxy.web(req, res, aliyunBackend);
  });
  router.all("/iwebap/*", function(req, res) {
    console.log('redirecting to NC');
    proxy.web(req, res, aliyunBackend);
  });
  router.all("/portal", function(req, res) {
    console.log('redirecting to NC');
    proxy.web(req, res, aliyunBackend);
  });
  router.all("/portal/*", function(req, res) {
    console.log('redirecting to NC');
    proxy.web(req, res, aliyunBackend);
  });
  router.all("/lfw/*", function(req, res) {
    console.log('redirecting to NC');
    proxy.web(req, res, aliyunBackend);
  });
  return router;
};


