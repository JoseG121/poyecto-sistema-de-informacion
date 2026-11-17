import { z } from 'zod';

export const cedulaSchema = z
  .string()
  .trim()
  .min(3, 'La cédula es demasiado corta')
  .max(30, 'La cédula es demasiado larga')
  .transform((value) => value.toUpperCase());

export const nombreSchema = z
  .string()
  .trim()
  .min(2, 'El nombre es demasiado corto')
  .max(80, 'El nombre es demasiado largo');

export const apellidoSchema = z
  .string()
  .trim()
  .min(2, 'El apellido es demasiado corto')
  .max(80, 'El apellido es demasiado largo');

export const direccionSchema = z
  .string()
  .trim()
  .max(200, 'La dirección es demasiado larga');

const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

export const fechaSchema = z
  .string()
  .trim()
  .regex(fechaRegex, 'La fecha debe tener el formato AAAA-MM-DD');

export const registroSchema = z.object({
  cedula: cedulaSchema,
  nombre: nombreSchema,
  apellido: apellidoSchema,
  direccion: direccionSchema.optional(),
  contrasena: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(72, 'La contraseña es demasiado larga'),
  claveValidacion: z.string().min(1, 'La clave de validación es obligatoria'),
  rol: z.enum(['admin', 'user']).default('user'),
});

export const loginSchema = z.object({
  cedula: cedulaSchema,
  contrasena: z.string().min(1, 'La contraseña es obligatoria'),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
