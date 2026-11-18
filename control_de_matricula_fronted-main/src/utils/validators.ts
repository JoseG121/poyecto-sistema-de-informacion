import { z } from 'zod'

import {
  INSTRUMENT_CATALOG,
  INSTRUMENT_CATEGORIES,
  VALIDATION_KEY,
} from '@/utils/constants'

const CEDULA_PATTERN = /^[VEve]?-?\d{6,10}$/
const NAME_PATTERN = /^[\p{L}\s'’-]+$/u
const SERIAL_PATTERN = /^[A-Za-z0-9-]+$/

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres')

export const requiredCedulaSchema = z
  .string()
  .trim()
  .min(1, 'La cédula es obligatoria')
  .max(30, 'La cédula es demasiado larga')
  .regex(CEDULA_PATTERN, 'Formato inválido. Ejemplo: V-12345678')

export const loginSchema = z.object({
  cedula: requiredCedulaSchema,
  contrasena: z.string().min(1, 'Ingresa tu contraseña'),
})

export const registerSchema = z
  .object({
    cedula: requiredCedulaSchema,
    nombre: z
      .string()
      .trim()
      .min(2, 'Debe tener al menos 2 caracteres')
      .max(60, 'No puede superar 60 caracteres')
      .regex(NAME_PATTERN, 'Usa solo letras y espacios'),
    apellido: z
      .string()
      .trim()
      .min(2, 'Debe tener al menos 2 caracteres')
      .max(60, 'No puede superar 60 caracteres')
      .regex(NAME_PATTERN, 'Usa solo letras y espacios'),
    contrasena: passwordSchema,
    confirmarContrasena: z.string().min(1, 'Confirma tu contraseña'),
    claveValidacion: z
      .string()
      .min(1, 'Ingresa la clave de validación')
      .refine(
        (value): boolean => value === VALIDATION_KEY,
        'La clave de validación es incorrecta',
      ),
  })
  .refine((data) => data.contrasena === data.confirmarContrasena, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContrasena'],
  })

export const optionalCedulaSchema = z
  .string()
  .trim()
  .max(30, 'La cédula es demasiado larga')
  .refine(
    (value) => value === '' || CEDULA_PATTERN.test(value),
    'Formato inválido. Ejemplo: V-12345678',
  )

const personNameSchema = z
  .string()
  .trim()
  .min(2, 'Debe tener al menos 2 caracteres')
  .max(60, 'No puede superar 60 caracteres')
  .regex(NAME_PATTERN, 'Usa solo letras y espacios')

export const parentescoSchema = z
  .string()
  .trim()
  .min(2, 'Indica el parentesco')
  .max(50, 'El parentesco no puede superar 50 caracteres')

export const direccionSchema = z
  .string()
  .trim()
  .min(1, 'La dirección es obligatoria')
  .max(200, 'La dirección no puede superar 200 caracteres')

export const fechaNacimientoSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  }, 'La fecha no es válida')
  .refine(
    (value) => new Date(`${value}T00:00:00Z`) <= new Date(),
    'La fecha de nacimiento no puede ser futura',
  )

export const telefonoSchema = z
  .string()
  .trim()
  .min(1, 'El teléfono es obligatorio')
  .max(30, 'El teléfono no puede superar 30 caracteres')

export const correoOpcionalSchema = z
  .string()
  .trim()
  .max(160, 'El correo no puede superar 160 caracteres')
  .refine(
    (value) => value === '' || z.string().email().safeParse(value).success,
    'Correo inválido',
  )

export const studentSchema = z.object({
  studentCedula: optionalCedulaSchema,
  firstName: personNameSchema,
  lastName: personNameSchema,
  studentDireccion: direccionSchema,
  fechaNacimiento: fechaNacimientoSchema,
  representativeCedula: requiredCedulaSchema,
  representativeFirstName: personNameSchema,
  representativeLastName: personNameSchema,
  representativeDireccion: direccionSchema,
  representativeTelefono: telefonoSchema,
  representativeCorreo: correoOpcionalSchema,
  parentesco: parentescoSchema,
})

export const serialSchema = z
  .string()
  .trim()
  .min(3, 'El serial debe tener al menos 3 caracteres')
  .max(30, 'El serial no puede superar 30 caracteres')
  .regex(SERIAL_PATTERN, 'Usa solo letras, números y guiones')

export const instrumentSchema = z
  .object({
    category: z.enum(INSTRUMENT_CATEGORIES, {
      message: 'Selecciona una categoría',
    }),
    name: z
      .string()
      .trim()
      .min(1, 'Selecciona o escribe el instrumento')
      .max(60, 'El nombre no puede superar 60 caracteres'),
    brand: z
      .string()
      .trim()
      .min(2, 'La marca debe tener al menos 2 caracteres')
      .max(60, 'La marca no puede superar 60 caracteres'),
    serial: serialSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.category !== 'percusion' &&
      !INSTRUMENT_CATALOG[data.category].some((item) => item === data.name)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['name'],
        message: 'Selecciona un instrumento válido para la categoría',
      })
    }
  })

export const assignmentSchema = z.object({
  studentId: z.string().min(1, 'Selecciona un estudiante'),
  instrumentSerial: serialSchema,
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type StudentFormValues = z.infer<typeof studentSchema>
export type InstrumentFormValues = z.infer<typeof instrumentSchema>
export type AssignmentFormValues = z.infer<typeof assignmentSchema>
