import express from 'express';
const router = express.Router();

import admins from './admin.js';
import users from './api/v1/users.js';
import auth from './api/v1/auth.js';
import verifications from './api/v1/verifications.js';
import universities from './api/v1/universities.js';
import comparisons from './api/v1/comparisons.js';
import { authenticator } from '../middlewares/auth-middleware.js';

router.use(admins);
router.use('/api/v1/users', users);
router.use('/api/v1/auth', auth);
router.use('/api/v1/verifications', verifications);
router.use('/api/v1/universities', universities);
router.use('/api/v1/comparisons', authenticator, comparisons);

export default router;
