import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) { res.status(401).json({ message: 'No autorizado' }); return; }

    const LANDING_API = process.env.LANDING_API_URL || 'http://localhost:3000';
    const response = await fetch(`${LANDING_API}/company/info/${companyId}`);
    if (!response.ok) { res.status(500).json({ message: 'Error al obtener perfil' }); return; }
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) { res.status(401).json({ message: 'No autorizado' }); return; }

    const LANDING_API = process.env.LANDING_API_URL || 'http://localhost:3000';
    const API_KEY = process.env.RESERVAYA_API_KEY || '';

    const { name, address, phone, email, description, tagline, country, image } = req.body;
    const updateData: Record<string, string> = {};

    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (description !== undefined) updateData.description = description;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (country !== undefined) updateData.country = country;
    if (image !== undefined) updateData.image = image;

    const response = await fetch(`${LANDING_API}/company/update/${companyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[businessProfile] Landing API error:', response.status, err);
      res.status(500).json({ message: 'Error al actualizar perfil en el servidor' });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

export const getPublicProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyId } = req.query as { companyId?: string };
    if (!companyId) { res.status(400).json({ message: 'companyId requerido' }); return; }

    const LANDING_API = process.env.LANDING_API_URL || 'http://localhost:3000';
    const response = await fetch(`${LANDING_API}/company/info/${companyId}`);
    if (!response.ok) {
      res.json({ companyId, name: '', image: '', address: '', phone: '', email: '', description: '', tagline: '' });
      return;
    }
    const data = await response.json();
    res.json(data);
  } catch {
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};
