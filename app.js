const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require("./routes");
const errorHandler = require('./middlewares/error-handler');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);
app.use(errorHandler);

module.exports = app;
