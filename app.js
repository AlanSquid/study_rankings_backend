import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import usePassport from './lib/passport.js';
import cors from 'cors';
import admins from './lib/admin.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 排程套件
import './lib/scheduler.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

// 後台管理
app.use(admins);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

usePassport(app);
app.use(routes);
app.use(errorHandler);

export default app;
