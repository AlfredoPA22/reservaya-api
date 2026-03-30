import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import Professional from '../models/Professional';
import mongoose from 'mongoose';

export const getProfessionalReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { start, end } = req.query as Record<string, string>;

    const dateFilter: Record<string, string> = {};
    if (start) dateFilter.$gte = start;
    if (end) dateFilter.$lte = end;
    const matchStage = (start || end) ? { date: dateFilter } : {};

    // Agregar por profesional y estado
    const pipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: { professionalId: '$professionalId', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.professionalId',
          statuses: {
            $push: { status: '$_id.status', count: '$count' },
          },
          total: { $sum: '$count' },
        },
      },
      {
        $lookup: {
          from: 'professionals',
          localField: '_id',
          foreignField: '_id',
          as: 'professional',
        },
      },
      { $unwind: '$professional' },
      { $sort: { total: -1 } },
    ];

    const rawStats = await Appointment.aggregate(pipeline);

    // También calcular ingresos (completados con precio del servicio)
    const revenuePipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          ...matchStage,
          status: 'completed',
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'service',
        },
      },
      { $unwind: '$service' },
      {
        $group: {
          _id: '$professionalId',
          revenue: { $sum: '$service.price' },
          completedCount: { $sum: 1 },
        },
      },
    ];

    const revenueStats = await Appointment.aggregate(revenuePipeline);
    const revenueMap = new Map(
      revenueStats.map((r) => [String(r._id), { revenue: r.revenue, completedCount: r.completedCount }])
    );

    // Servicio más solicitado por profesional
    const topServicePipeline: mongoose.PipelineStage[] = [
      { $match: matchStage },
      {
        $group: {
          _id: { professionalId: '$professionalId', serviceId: '$serviceId' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $group: {
          _id: '$_id.professionalId',
          topServiceId: { $first: '$_id.serviceId' },
          topServiceCount: { $first: '$count' },
        },
      },
      {
        $lookup: {
          from: 'services',
          localField: 'topServiceId',
          foreignField: '_id',
          as: 'topService',
        },
      },
      { $unwind: { path: '$topService', preserveNullAndEmptyArrays: true } },
    ];

    const topServices = await Appointment.aggregate(topServicePipeline);
    const topServiceMap = new Map(
      topServices.map((t) => [
        String(t._id),
        { name: t.topService?.name, count: t.topServiceCount },
      ])
    );

    const result = rawStats.map((stat) => {
      const profId = String(stat._id);
      const statusMap: Record<string, number> = {};
      stat.statuses.forEach(({ status, count }: { status: string; count: number }) => {
        statusMap[status] = count;
      });
      const rev = revenueMap.get(profId);
      const top = topServiceMap.get(profId);

      return {
        professional: {
          _id: stat.professional._id,
          name: stat.professional.name,
          specialty: stat.professional.specialty,
          active: stat.professional.active,
        },
        total: stat.total,
        pending: statusMap.pending || 0,
        confirmed: statusMap.confirmed || 0,
        completed: statusMap.completed || 0,
        cancelled: statusMap.cancelled || 0,
        revenue: rev?.revenue || 0,
        topService: top || null,
      };
    });

    // Agregar profesionales sin reservas
    const allProfessionals = await Professional.find({ active: true });
    const withStats = new Set(rawStats.map((s) => String(s._id)));
    const noStats = allProfessionals
      .filter((p) => !withStats.has(String(p._id)))
      .map((p) => ({
        professional: { _id: p._id, name: p.name, specialty: p.specialty, active: p.active },
        total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0, revenue: 0, topService: null,
      }));

    res.json([...result, ...noStats]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar reportes' });
  }
};
