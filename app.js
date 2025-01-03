const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');
const usePassport = require('./lib/passport');
const cors = require('cors');

// 排程套件
require('./lib/scheduler');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

usePassport(app);
app.use(routes);
app.use(errorHandler);

module.exports = app;
