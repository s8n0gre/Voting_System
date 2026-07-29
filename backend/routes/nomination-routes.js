import { Router } from 'express';
import * as nominationController from '../controllers/nomination-controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

router.get('/nominations/:execId/:roleTitle', asyncHandler(nominationController.getNominations));
router.post('/nominate', asyncHandler(nominationController.nominate));
router.post('/vote-nominee', asyncHandler(nominationController.vote));
router.get('/my-nominations', asyncHandler(nominationController.myNominations));
router.post('/withdraw-nomination', asyncHandler(nominationController.withdraw));

export default router;
