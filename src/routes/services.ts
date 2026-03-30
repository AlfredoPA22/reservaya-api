import { Router } from 'express';
import { getServices, getAllServices, createService, updateService, toggleService, deleteService, assignProfessionals } from '../controllers/serviceController';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getServices);
router.get('/all', verifyToken, requireAdmin, getAllServices);
router.post('/', verifyToken, requireAdmin, createService);
router.put('/:id', verifyToken, requireAdmin, updateService);
router.patch('/:id/toggle', verifyToken, requireAdmin, toggleService);
router.delete('/:id', verifyToken, requireAdmin, deleteService);
router.put('/:id/professionals', verifyToken, requireAdmin, assignProfessionals);

export default router;
