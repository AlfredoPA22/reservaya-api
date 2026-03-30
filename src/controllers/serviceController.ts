import { Request, Response } from 'express';
import Service from '../models/Service';
import Professional from '../models/Professional';
import { AuthRequest } from '../middleware/auth';

export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string);
    const filter: Record<string, unknown> = { active: true };
    if (companyId) filter.companyId = companyId;
    const services = await Service.find(filter).sort({ name: 1 });
    res.json(services);
  } catch {
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
};

export const getAllServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const services = await Service.find(filter).sort({ name: 1 });
    res.json(services);
  } catch {
    res.status(500).json({ message: 'Error al obtener servicios' });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = { ...req.body, companyId: req.user?.companyId };
    const service = await Service.create(data);
    res.status(201).json(service);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al crear servicio';
    res.status(400).json({ message: msg });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const service = await Service.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!service) { res.status(404).json({ message: 'Servicio no encontrado' }); return; }
    res.json(service);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al actualizar';
    res.status(400).json({ message: msg });
  }
};

export const toggleService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const service = await Service.findOne(filter);
    if (!service) { res.status(404).json({ message: 'Servicio no encontrado' }); return; }
    service.active = !service.active;
    await service.save();
    res.json(service);
  } catch {
    res.status(500).json({ message: 'Error al cambiar estado del servicio' });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const service = await Service.findOneAndDelete(filter);
    if (!service) { res.status(404).json({ message: 'Servicio no encontrado' }); return; }
    res.json({ message: 'Servicio eliminado permanentemente' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar servicio' });
  }
};

export const assignProfessionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const serviceId = req.params.id;
    const { professionalIds } = req.body as { professionalIds: string[] };
    const companyFilter: Record<string, unknown> = {};
    if (req.user?.companyId) companyFilter.companyId = req.user.companyId;

    await Professional.updateMany(
      { ...companyFilter, serviceIds: serviceId },
      { $pull: { serviceIds: serviceId } }
    );

    if (professionalIds && professionalIds.length > 0) {
      await Professional.updateMany(
        { ...companyFilter, _id: { $in: professionalIds } },
        { $addToSet: { serviceIds: serviceId } }
      );
    }

    res.json({ message: 'Profesionales asignados correctamente' });
  } catch {
    res.status(500).json({ message: 'Error al asignar profesionales' });
  }
};
