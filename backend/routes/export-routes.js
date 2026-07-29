import { Router } from 'express';
import * as exportController from '../controllers/export-controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

router.get('/export', asyncHandler(exportController.exportResults));
router.get('/download-nominations', asyncHandler(exportController.downloadNominations));

export default router;
