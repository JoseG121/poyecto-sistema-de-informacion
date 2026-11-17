import type { LoginInput, RegistroInput } from '../schemas/autenticacion.schema';
import { iniciarSesion, registrarUsuario } from '../services/autenticacion.service';
import { asyncHandler } from '../utils/asyncHandler';

export const registro = asyncHandler(async (req, res) => {
  const input = req.body as RegistroInput;
  const usuario = await registrarUsuario(input);

  res.status(201).json({ datos: { usuario } });
});

export const login = asyncHandler(async (req, res) => {
  const input = req.body as LoginInput;
  const resultado = await iniciarSesion(input);

  res.json({ datos: resultado });
});

export const perfil = asyncHandler(async (req, res) => {
  res.json({ datos: req.user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({
    datos: { mensaje: 'Sesión cerrada. Elimina el token en el cliente.' },
  });
});
