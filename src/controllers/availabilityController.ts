import { Request, Response } from 'express';
import Professional from '../models/Professional';
import Service from '../models/Service';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
type DayName = typeof DAY_NAMES[number];

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let current = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (current + duration <= endMin) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += duration;
  }
  return slots;
}

export const getAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { professionalId, date, serviceId } = req.query as Record<string, string>;
    const companyId = req.user?.companyId || (req.query.companyId as string);

    if (!professionalId || !date || !serviceId) {
      res.status(400).json({ message: 'professionalId, date y serviceId son requeridos' });
      return;
    }

    const [professional, service] = await Promise.all([
      Professional.findById(professionalId),
      Service.findById(serviceId),
    ]);

    if (!professional) { res.status(404).json({ message: 'Profesional no encontrado' }); return; }
    if (!service) { res.status(404).json({ message: 'Servicio no encontrado' }); return; }

    const dateObj = new Date(date + 'T00:00:00');
    const dayName: DayName = DAY_NAMES[dateObj.getDay()];
    const daySchedule = professional.workingHours[dayName];

    if (!daySchedule.active) {
      res.json({ slots: [], message: 'El profesional no trabaja ese día' });
      return;
    }

    const allSlots = generateSlots(daySchedule.start, daySchedule.end, service.duration);

    const appointmentFilter: Record<string, unknown> = {
      professionalId,
      date,
      status: { $nin: ['cancelled'] },
    };
    if (companyId) appointmentFilter.companyId = companyId;

    const existingAppointments = await Appointment.find(appointmentFilter);

    const freeSlots = allSlots.filter((slot) => {
      const [sh, sm] = slot.split(':').map(Number);
      const slotStart = sh * 60 + sm;
      const slotEnd = slotStart + service.duration;

      for (const occ of existingAppointments) {
        const [oh, om] = occ.timeSlot.split(':').map(Number);
        const occStart = oh * 60 + om;
        if (slotStart < occStart + service.duration && slotEnd > occStart) {
          return false;
        }
      }
      return true;
    });

    res.json({ slots: freeSlots, date, professionalId, serviceId });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener disponibilidad' });
  }
};
