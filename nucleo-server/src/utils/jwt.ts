import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthUser, Rol } from '../types/auth';

export interface TokenPayload {
  sub: string;
  cedula: string;
  rol: Rol;
}

export function signToken(user: AuthUser): string {
  const options: SignOptions = {
    subject: String(user.id),
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({ cedula: user.cedula, rol: user.rol }, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Token inválido');
  }

  if (decoded.rol !== 'admin' && decoded.rol !== 'user') {
    throw new Error('Rol inválido en el token');
  }

  return {
    sub: String(decoded.sub),
    cedula: String(decoded.cedula ?? ''),
    rol: decoded.rol,
  };
}
