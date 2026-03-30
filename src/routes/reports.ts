import { Router } from 'express';
import { getProfessionalReports } from '../controllers/reportsController';
import { verifyToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/professionals', verifyToken, requireAdmin, getProfessionalReports);

export default router;
