import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { verifyToken, type TokenPayload } from '../utils/jwt';
import { findUsuarioById, toAuthUser } from '../models/usuario.model';

export const autenticar = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Debes iniciar sesión');
  }

  const token = header.slice(7).trim();

  if (!token) {
    throw new AppError(401, 'Debes iniciar sesión');
  }

  let payload: TokenPayload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new AppError(401, 'Sesión inválida o expirada');
  }

  const usuarioId = Number(payload.sub);

  if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
    throw new AppError(401, 'Sesión inválida');
  }

  const usuario = await findUsuarioById(usuarioId);

  if (!usuario) {
    throw new AppError(401, 'La cuenta no está disponible');
  }

  req.user = toAuthUser(usuario);
  next();
});
