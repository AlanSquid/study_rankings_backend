import express from 'express';
const router = express.Router();
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import * as AdminJSSequelize from '@adminjs/sequelize';
import db from '../models/index.js';

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database
});

const adminOptions = {
  // resources: [User],
  resources: Object.values(db.sequelize.models)
};

const admin = new AdminJS(adminOptions);

const adminRouter = AdminJSExpress.buildRouter(admin);
router.use(admin.options.rootPath, adminRouter);

export default router;
