import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; role: string; companyId: string };
}

interface JwtPayload {
  id: string;
  role: string;
  companyId: string;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Token requerido' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role, companyId: decoded.companyId || '' };
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Setea req.user si hay token válido, pero no bloquea si no hay token
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'secret') as JwtPayload;
      req.user = { id: decoded.id, role: decoded.role, companyId: decoded.companyId || '' };
    } catch {
      // token inválido, continúa sin usuario
    }
  }
  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Acceso restringido a administradores' });
    return;
  }
  next();
};
