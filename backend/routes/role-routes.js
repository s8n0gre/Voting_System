import { Router } from 'express';
import * as roleController from '../controllers/role-controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

router.get('/roles', asyncHandler(roleController.getRoles));
router.get('/role/:id', asyncHandler(roleController.getSingleRole));
router.get('/supporting-role/:id', asyncHandler(roleController.getSupportingRole));
router.get('/supporting-role/:id/candidates', asyncHandler(roleController.getSupportingRoleCandidates));
router.get('/verify-student', asyncHandler(roleController.verifyStudent));
router.get('/status', asyncHandler(roleController.getStatus));
router.get('/students', asyncHandler(roleController.getStudents));

export default router;
