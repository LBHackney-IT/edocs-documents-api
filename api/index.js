require('module-alias/register');
require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const path = require('path');
const app = express();

app.use(function(req, res, next) {
  // had to rewrite the path to get it playing nice with a not-root resource in api gateway
  req.url = req.url.replace(`/${process.env.URL_PREFIX}`, '');
  next();
});

app.get('/', async (req, res) => {
  res.send('Hello World');
});

module.exports.handler = serverless(app, {
  binary: ['*/*']
});
