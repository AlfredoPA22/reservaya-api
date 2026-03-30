import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth';
import { getMyProfile, updateMyProfile, getPublicProfile } from '../controllers/businessProfileController';

const router = Router();

// Public: client booking page fetches company profile
router.get('/public', getPublicProfile);

// Admin: view and edit own company profile
router.get('/', verifyToken, requireAdmin, getMyProfile);
router.put('/', verifyToken, requireAdmin, updateMyProfile);

export default router;
