import express from 'express';
import session from 'express-session';
const router = express.Router();
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import db from '../models/index.js';
import connectSessionSequelize from 'connect-session-sequelize';
const SequelizeStore = connectSessionSequelize(session.Store);

// 預設管理員帳號
const DEFAULT_ADMIN = {
  email: 'admin@example.com',
  password: 'password'
};

// 驗證邏輯
const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

// 設置 session store，使用既有的 sequelize 實例
const sessionStore = new SequelizeStore({
  db: db.sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 12 * 60 * 60 * 1000, // 每 12 小時檢查一次過期的session並刪除
  expiration: 24 * 60 * 60 * 1000 // session 24 小時後過期
});

// 同步 session 資料表
sessionStore.sync();

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database
});

const adminOptions = {
  resources: Object.values(db.sequelize.models)
};

const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
  admin, // AdminJS 的實例
  {
    authenticate, // 身份驗證函數
    cookieName: 'adminjs', // 用於存儲 session 的 cookie 名稱
    cookiePassword: process.env.SESSION_SECRET // 用於加密 cookie 的密碼
  },
  null, // 沒有自定義的路由器，傳入 null
  {
    store: sessionStore, // 使用 Sequelize Store 來存儲 session
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET, // 用於加密 session 的密碼
    cookie: {
      httpOnly: process.env.NODE_ENV === 'production', // 僅在生產環境中設置 httpOnly
      secure: process.env.NODE_ENV === 'production', // 僅在生產環境中設置 secure
      maxAge: 24 * 60 * 60 * 1000 // session 的有效時間 24 小時
    },
    name: 'adminjs' // session 的名稱
  }
);
router.use(admin.options.rootPath, adminRouter);

export default router;
