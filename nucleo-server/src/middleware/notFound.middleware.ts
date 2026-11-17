import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};
