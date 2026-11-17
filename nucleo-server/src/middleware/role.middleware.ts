import type { RequestHandler } from 'express';
import type { Rol } from '../types/auth';
import { AppError } from '../utils/AppError';

export function requireRol(...roles: Rol[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError(401, 'Debes iniciar sesión'));
      return;
    }

    if (!roles.includes(req.user.rol)) {
      next(new AppError(403, 'No tienes permisos para realizar esta acción'));
      return;
    }

    next();
  };
}
