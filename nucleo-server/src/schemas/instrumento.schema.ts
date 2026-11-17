import { z } from 'zod';
import {
  instrumentCatalog,
  instrumentCategories,
  resolveCategory,
  resolveInstrumentName,
  type InstrumentCategory,
} from '../config/instrument-catalog';
import { paginacionQuerySchema } from './common.schema';

export const categoriaSchema = z.preprocess(
  (value) => (typeof value === 'string' ? resolveCategory(value) : value),
  z.custom<InstrumentCategory>(
    (value) =>
      typeof value === 'string' && instrumentCategories.includes(value as InstrumentCategory),
    {
      message: 'Categoría inválida. Usa: cuerda, madera, metal o percusion',
    },
  ),
);

const serialSchema = z
  .string()
  .trim()
  .min(2, 'El serial es demasiado corto')
  .max(80, 'El serial es demasiado largo')
  .transform((value) => value.toUpperCase());

const marcaSchema = z
  .string()
  .trim()
  .min(2, 'La marca del instrumento es demasiado corta')
  .max(100, 'La marca del instrumento es demasiado larga');

export const crearInstrumentoSchema = z
  .object({
    categoria: categoriaSchema,
    nombre: z
      .string()
      .trim()
      .min(2, 'El nombre del instrumento es demasiado corto')
      .max(80, 'El nombre del instrumento es demasiado largo'),
    marca: marcaSchema,
    serial: serialSchema,
  })
  .superRefine((data, ctx) => {
    if (resolveInstrumentName(data.categoria, data.nombre) !== null) {
      return;
    }

    const allowed =
      data.categoria === 'percusion'
        ? 'en percusión se acepta un texto descriptivo libre'
        : `los permitidos son: ${instrumentCatalog[data.categoria].join(', ')}`;

    ctx.addIssue({
      code: 'custom',
      path: ['nombre'],
      message: `Instrumento inválido para la categoría ${data.categoria}. Para esta categoría ${allowed}`,
    });
  })
  .transform((data) => ({
    categoria: data.categoria,
    nombre: resolveInstrumentName(data.categoria, data.nombre) ?? data.nombre.trim(),
    marca: data.marca,
    serial: data.serial,
  }));

export const asignarInstrumentoSchema = z.object({
  serial: serialSchema,
  marca: marcaSchema,
  idEstudiante: z.coerce
    .number()
    .int('El ID del estudiante debe ser un número entero')
    .positive('El ID del estudiante debe ser mayor a 0'),
});

export const verificarSerialQuerySchema = z.object({
  serial: serialSchema,
});

export const instrumentoListQuerySchema = paginacionQuerySchema.extend({
  buscar: z.string().trim().max(120, 'La búsqueda es demasiado larga').optional(),
  categoria: categoriaSchema.optional(),
  estado: z.enum(['disponible', 'asignado']).optional(),
});

export type CrearInstrumentoInput = z.infer<typeof crearInstrumentoSchema>;
export type AsignarInstrumentoInput = z.infer<typeof asignarInstrumentoSchema>;
export type InstrumentoListQuery = z.infer<typeof instrumentoListQuerySchema>;
