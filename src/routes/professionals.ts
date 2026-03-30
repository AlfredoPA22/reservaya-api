import { Router } from 'express';
import {
  getProfessionals, getAllProfessionals, getProfessionalById,
  createProfessional, updateProfessional, toggleProfessional, deleteProfessional,
} from '../controllers/professionalController';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getProfessionals);
router.get('/all', verifyToken, requireAdmin, getAllProfessionals);
router.get('/:id', optionalAuth, getProfessionalById);
router.post('/', verifyToken, requireAdmin, createProfessional);
router.put('/:id', verifyToken, requireAdmin, updateProfessional);
router.patch('/:id/toggle', verifyToken, requireAdmin, toggleProfessional);
router.delete('/:id', verifyToken, requireAdmin, deleteProfessional);

export default router;
