import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

export const createAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = { ...req.body };
    if (req.user) {
      data.clientId = req.user.id;
      if (req.user.companyId) data.companyId = req.user.companyId;
    } else {
      // Guest booking: companyId from query param (added by frontend interceptor)
      if (!data.companyId && req.query.companyId) {
        data.companyId = req.query.companyId as string;
      }
    }

    const existing = await Appointment.findOne({
      professionalId: data.professionalId,
      date: data.date,
      timeSlot: data.timeSlot,
      status: { $nin: ['cancelled'] },
    });
    if (existing) {
      res.status(409).json({ message: 'El horario ya está reservado, por favor elegí otro' });
      return;
    }

    const appointment = await Appointment.create(data);
    const populated = await appointment.populate(['professionalId', 'serviceId']);
    res.status(201).json(populated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al crear reserva';
    res.status(400).json({ message: msg });
  }
};

export const getAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status, professionalId } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {};

    if (req.user?.role === 'admin') {
      if (req.user.companyId) filter.companyId = req.user.companyId;
    } else {
      // Client: only their own appointments
      filter.clientId = req.user?.id;
    }

    if (date) filter.date = date;
    if (status) filter.status = status;
    if (professionalId) filter.professionalId = professionalId;

    const appointments = await Appointment.find(filter)
      .populate('professionalId', 'name specialty avatar')
      .populate('serviceId', 'name price duration')
      .populate('clientId', 'name email phone')
      .sort({ date: 1, timeSlot: 1 });

    res.json(appointments);
  } catch {
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('professionalId', 'name specialty avatar')
      .populate('serviceId', 'name price duration')
      .populate('clientId', 'name email phone');
    if (!appointment) { res.status(404).json({ message: 'Reserva no encontrada' }); return; }
    res.json(appointment);
  } catch {
    res.status(500).json({ message: 'Error al obtener reserva' });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: 'Estado inválido' });
      return;
    }
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const appointment = await Appointment.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    ).populate(['professionalId', 'serviceId', 'clientId']);
    if (!appointment) { res.status(404).json({ message: 'Reserva no encontrada' }); return; }
    res.json(appointment);
  } catch {
    res.status(500).json({ message: 'Error al actualizar estado' });
  }
};

export const cancelAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) { res.status(404).json({ message: 'Reserva no encontrada' }); return; }

    if (req.user?.role !== 'admin' && String(appointment.clientId) !== req.user?.id) {
      res.status(403).json({ message: 'Sin permiso para cancelar esta reserva' });
      return;
    }
    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ message: 'Reserva cancelada', appointment });
  } catch {
    res.status(500).json({ message: 'Error al cancelar reserva' });
  }
};

export const getAppointmentsByDateRange = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = {
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled'] },
    };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const appointments = await Appointment.find(filter)
      .populate('professionalId', 'name specialty avatar')
      .populate('serviceId', 'name price duration')
      .populate('clientId', 'name email phone')
      .sort({ date: 1, timeSlot: 1 });
    res.json(appointments);
  } catch {
    res.status(500).json({ message: 'Error al obtener reservas' });
  }
};
