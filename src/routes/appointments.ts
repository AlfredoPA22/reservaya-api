import { Router } from 'express';
import {
  createAppointment, getAppointments, getAppointmentById,
  updateAppointmentStatus, cancelAppointment, getAppointmentsByDateRange,
} from '../controllers/appointmentController';
import { verifyToken, requireAdmin, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/', optionalAuth, createAppointment); // público (con o sin token)
router.get('/', verifyToken, getAppointments);
router.get('/range', verifyToken, requireAdmin, getAppointmentsByDateRange);
router.get('/:id', verifyToken, getAppointmentById);
router.patch('/:id/status', verifyToken, requireAdmin, updateAppointmentStatus);
router.patch('/:id/cancel', verifyToken, cancelAppointment);

export default router;
