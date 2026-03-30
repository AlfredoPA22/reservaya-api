import { Router } from 'express';
import { register, login, getMe, createAdmin } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin); // setup inicial
router.get('/me', verifyToken, getMe);

export default router;
