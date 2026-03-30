import { Router } from 'express';
import { getAvailability } from '../controllers/availabilityController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getAvailability);

export default router;
