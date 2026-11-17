import { env } from '../config/env';
import { withTransaction } from '../db/pool';
import { createPersona, findPersonaByCedula } from '../models/persona.model';
import {
  createUsuario,
  findUsuarioByCedula,
  findUsuarioById,
  incrementarIntentosFallidos,
  reiniciarIntentosFallidos,
  toAuthUser,
} from '../models/usuario.model';
import type { LoginInput, RegistroInput } from '../schemas/autenticacion.schema';
import type { AuthUser } from '../types/auth';
import { AppError } from '../utils/AppError';
import { signToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { safeCompare } from '../utils/secureCompare';

export interface LoginResult {
  token: string;
  usuario: AuthUser;
}

export async function registrarUsuario(input: RegistroInput): Promise<AuthUser> {
  if (!safeCompare(input.claveValidacion, env.registrationKey)) {
    throw new AppError(400, 'La clave de validación es incorrecta');
  }

  const contrasena = await hashPassword(input.contrasena);

  const usuarioId = await withTransaction(async (client) => {
    const personaExistente = await findPersonaByCedula(client, input.cedula);

    if (personaExistente) {
      throw new AppError(409, 'La cédula ya está registrada en el sistema');
    }

    const persona = await createPersona(client, {
      cedula: input.cedula,
      nombre: input.nombre,
      apellido: input.apellido,
      direccion: input.direccion ?? null,
    });

    return createUsuario(client, {
      contrasena,
      rol: input.rol,
      idPersona: persona.id,
    });
  });

  const usuario = await findUsuarioById(usuarioId);

  if (!usuario) {
    throw new AppError(500, 'No se pudo confirmar el usuario registrado');
  }

  return toAuthUser(usuario);
}

export async function iniciarSesion(input: LoginInput): Promise<LoginResult> {
  const usuario = await findUsuarioByCedula(input.cedula);

  if (!usuario) {
    throw new AppError(401, 'Cédula o contraseña incorrectas');
  }

  const contrasenaValida = await verifyPassword(input.contrasena, usuario.contrasena);

  if (!contrasenaValida) {
    await incrementarIntentosFallidos(usuario.id);
    throw new AppError(401, 'Cédula o contraseña incorrectas');
  }

  await reiniciarIntentosFallidos(usuario.id);

  const authUser = toAuthUser(usuario);

  return {
    token: signToken(authUser),
    usuario: authUser,
  };
}
