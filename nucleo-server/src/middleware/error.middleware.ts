import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

interface PostgresError extends Error {
  code?: string;
  constraint?: string;
}

const uniqueConstraintMessages: Record<string, string> = {
  persona_cedula_key: 'La cédula ya está registrada',
  usuario_id_persona_key: 'La persona ya tiene un usuario registrado',
  estudiante_id_persona_key: 'La persona ya está registrada como estudiante',
  representante_id_persona_key: 'La persona ya está registrada como representante',
  instrumento_serial_key: 'El serial del instrumento ya está registrado',
  estado_instrumento_id_instrumento_key:
    'El instrumento ya tiene un estado registrado',
  estudiante_representante_pareja_unique:
    'El representante ya está vinculado a este estudiante',
  estudiante_instrumento_id_estudiante_key:
    'El estudiante ya tiene un instrumento asignado',
  estudiante_instrumento_id_instrumento_key:
    'El instrumento ya está asignado a un estudiante',
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        mensaje: error.message,
        detalles: error.details,
      },
    });
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        mensaje: 'Datos inválidos',
        detalles: error.issues.map((issue) => ({
          campo: issue.path.join('.'),
          mensaje: issue.message,
        })),
      },
    });
    return;
  }

  const pgError = error as PostgresError;

  if (pgError.code === '23505') {
    const mensaje = pgError.constraint
      ? uniqueConstraintMessages[pgError.constraint]
      : undefined;

    res.status(409).json({
      error: {
        mensaje: mensaje ?? 'Ya existe un registro con ese valor único',
      },
    });
    return;
  }

  if (pgError.code === '23503') {
    res.status(409).json({
      error: {
        mensaje: 'El registro está relacionado con otros datos y no puede modificarse',
      },
    });
    return;
  }

  if (pgError.code === '23514') {
    res.status(400).json({
      error: { mensaje: 'Los datos no cumplen las reglas del sistema' },
    });
    return;
  }

  if (pgError.code === '22P02') {
    res.status(400).json({
      error: { mensaje: 'Uno de los valores enviados tiene un formato inválido' },
    });
    return;
  }

  if (error instanceof SyntaxError && 'status' in error && error.status === 400) {
    res.status(400).json({ error: { mensaje: 'JSON inválido' } });
    return;
  }

  console.error(error);
  res.status(500).json({ error: { mensaje: 'Error interno del servidor' } });
};
