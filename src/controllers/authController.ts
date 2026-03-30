import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const signToken = (id: string, role: string, companyId: string): string => {
  return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, companyId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }
    const user = await User.create({ name, email, password, phone, role: 'client', companyId });
    const token = signToken(String(user._id), user.role, user.companyId || '');
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, companyId: user.companyId } });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_name, email, password } = req.body;
    // Admin login: user_name. Client login: email.
    const query = user_name ? { user_name } : { email };
    if (!user_name && !email) {
      res.status(400).json({ message: 'Usuario o email requerido' });
      return;
    }
    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Credenciales incorrectos' });
      return;
    }
    const token = signToken(String(user._id), user.role, user.companyId || '');
    res.json({ token, user: { id: user._id, name: user.name, user_name: user.user_name, email: user.email, role: user.role, companyId: user.companyId } });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) { res.status(404).json({ message: 'Usuario no encontrado' }); return; }
    res.json(user);
  } catch {
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
};

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, user_name, password, phone, companyId } = req.body;

    if (!name || !password) {
      res.status(400).json({ message: 'name y password son requeridos' });
      return;
    }
    if (!user_name && !email) {
      res.status(400).json({ message: 'user_name o email es requerido' });
      return;
    }

    const query = user_name ? { user_name } : { email };
    const existing = await User.findOne(query);
    if (existing) { res.status(400).json({ message: 'Usuario ya registrado' }); return; }

    const user = await User.create({
      name,
      email: email || undefined,
      user_name: user_name || undefined,
      password,
      phone,
      role: 'admin',
      companyId,
    });

    const token = signToken(String(user._id), user.role, user.companyId || '');
    res.status(201).json({ token, user: { id: user._id, name: user.name, user_name: user.user_name, email: user.email, role: user.role, companyId: user.companyId } });
  } catch (error) {
    console.error('❌ createAdmin error:', error);
    res.status(500).json({ message: 'Error al crear admin', detail: error instanceof Error ? error.message : String(error) });
  }
};
