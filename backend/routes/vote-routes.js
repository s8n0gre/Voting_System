import { Router } from 'express';
import * as voteController from '../controllers/vote-controller.js';
import { asyncHandler } from '../middleware/error-handler.js';

const router = Router();

router.post('/vote', asyncHandler(voteController.castVote));
router.get('/results', asyncHandler(voteController.getResults));

export default router;
