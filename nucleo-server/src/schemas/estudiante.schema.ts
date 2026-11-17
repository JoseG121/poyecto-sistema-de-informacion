import { z } from 'zod';
import { paginacionQuerySchema } from './common.schema';
import {
  apellidoSchema,
  cedulaSchema,
  direccionSchema,
  fechaSchema,
  nombreSchema,
} from './autenticacion.schema';

const cedulaOpcionalSchema = z
  .union([cedulaSchema, z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return value;
  });

const direccionOpcionalSchema = z
  .union([direccionSchema, z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return value;
  });

const fechaOpcionalSchema = z
  .union([fechaSchema, z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return value;
  });

const correoSchema = z
  .string()
  .trim()
  .email('Correo inválido')
  .max(160, 'El correo es demasiado largo')
  .transform((value) => value.toLowerCase());

const correoOpcionalSchema = z
  .union([correoSchema, z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return value;
  });

const telefonoOpcionalSchema = z
  .union([z.string().trim().max(30, 'El teléfono es demasiado largo'), z.literal(''), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return value;
  });

export const estudiantePersonaSchema = z.object({
  cedula: cedulaOpcionalSchema,
  nombre: nombreSchema,
  apellido: apellidoSchema,
  direccion: direccionOpcionalSchema,
  fechaNacimiento: fechaOpcionalSchema,
});

export const representanteSchema = z.object({
  cedula: cedulaSchema,
  nombre: nombreSchema,
  apellido: apellidoSchema,
  direccion: direccionOpcionalSchema,
  correo: correoOpcionalSchema,
  telefono: telefonoOpcionalSchema,
  parentesco: z
    .string()
    .trim()
    .min(2, 'El parentesco es demasiado corto')
    .max(50, 'El parentesco es demasiado largo'),
});

export const crearEstudianteSchema = z.object({
  estudiante: estudiantePersonaSchema,
  representantes: z
    .array(representanteSchema)
    .min(1, 'Debes registrar al menos un representante')
    .max(10, 'No se pueden registrar más de 10 representantes'),
  fechaInscripcion: fechaOpcionalSchema,
});

export const estudianteListQuerySchema = paginacionQuerySchema.extend({
  buscar: z.string().trim().max(120, 'La búsqueda es demasiado larga').optional(),
  asignado: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type CrearEstudianteInput = z.infer<typeof crearEstudianteSchema>;
export type EstudianteListQuery = z.infer<typeof estudianteListQuerySchema>;
