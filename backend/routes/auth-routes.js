import { Router } from 'express';
import * as authController from '../controllers/auth-controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));

export default router;
