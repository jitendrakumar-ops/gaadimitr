import { Router } from 'express';
import { rateDriver, getDriverRatings, getAllRatings } from '../controllers/rating.controller.js';
import { authenticate, requireUser } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requireUser, rateDriver);
router.get('/driver/:driverId', getDriverRatings);
// admin / all ratings
router.get('/', getAllRatings);
router.get('/all-ratings', getAllRatings);

export default router;
