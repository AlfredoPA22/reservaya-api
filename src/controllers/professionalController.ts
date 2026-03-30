import { Request, Response } from 'express';
import Professional from '../models/Professional';
import { AuthRequest } from '../middleware/auth';

export const getProfessionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.query as Record<string, string>;
    const companyId = req.user?.companyId || (req.query.companyId as string);
    const filter: Record<string, unknown> = { active: true };
    if (serviceId) filter.serviceIds = serviceId;
    if (companyId) filter.companyId = companyId;
    const professionals = await Professional.find(filter).populate('serviceIds', 'name price duration').sort({ name: 1 });
    res.json(professionals);
  } catch {
    res.status(500).json({ message: 'Error al obtener profesionales' });
  }
};

export const getAllProfessionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const professionals = await Professional.find(filter).populate('serviceIds', 'name price duration').sort({ name: 1 });
    res.json(professionals);
  } catch {
    res.status(500).json({ message: 'Error al obtener profesionales' });
  }
};

export const getProfessionalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId || (req.query.companyId as string);
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (companyId) filter.companyId = companyId;
    const professional = await Professional.findOne(filter).populate('serviceIds', 'name price duration');
    if (!professional) { res.status(404).json({ message: 'Profesional no encontrado' }); return; }
    res.json(professional);
  } catch {
    res.status(500).json({ message: 'Error al obtener profesional' });
  }
};

export const createProfessional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = { ...req.body, companyId: req.user?.companyId };
    const professional = await Professional.create(data);
    const populated = await professional.populate('serviceIds', 'name price duration');
    res.status(201).json(populated);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al crear profesional';
    res.status(400).json({ message: msg });
  }
};

export const updateProfessional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const professional = await Professional.findOneAndUpdate(filter, req.body, { new: true, runValidators: true }).populate('serviceIds', 'name price duration');
    if (!professional) { res.status(404).json({ message: 'Profesional no encontrado' }); return; }
    res.json(professional);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al actualizar';
    res.status(400).json({ message: msg });
  }
};

export const toggleProfessional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const professional = await Professional.findOne(filter);
    if (!professional) { res.status(404).json({ message: 'Profesional no encontrado' }); return; }
    professional.active = !professional.active;
    await professional.save();
    res.json(professional);
  } catch {
    res.status(500).json({ message: 'Error al cambiar estado del profesional' });
  }
};

export const deleteProfessional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filter: Record<string, unknown> = { _id: req.params.id };
    if (req.user?.companyId) filter.companyId = req.user.companyId;
    const professional = await Professional.findOneAndDelete(filter);
    if (!professional) { res.status(404).json({ message: 'Profesional no encontrado' }); return; }
    res.json({ message: 'Profesional eliminado permanentemente' });
  } catch {
    res.status(500).json({ message: 'Error al eliminar profesional' });
  }
};
