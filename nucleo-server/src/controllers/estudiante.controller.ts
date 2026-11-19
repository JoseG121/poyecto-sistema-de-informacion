import { estudianteListQuerySchema } from '../schemas/estudiante.schema';
import type {
  ActualizarEstudianteInput,
  CrearEstudianteInput,
} from '../schemas/estudiante.schema';
import {
  actualizarEstudiante,
  crearEstudiante,
  eliminarEstudiante,
  listarEstudiantes,
  obtenerEstudiante,
  obtenerPlanilla,
} from '../services/estudiante.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parseId } from '../utils/parseId';

export const getEstudiantes = asyncHandler(async (req, res) => {
  const query = estudianteListQuerySchema.parse(req.query);
  const resultado = await listarEstudiantes(query);

  res.json({
    datos: resultado.items,
    meta: {
      pagina: query.pagina,
      limite: query.limite,
      total: resultado.total,
      totalPaginas: Math.ceil(resultado.total / query.limite),
    },
  });
});

export const getEstudianteById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del estudiante');
  const estudiante = await obtenerEstudiante(id);

  res.json({ datos: estudiante });
});

export const getPlanillaEstudiante = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del estudiante');
  const planilla = await obtenerPlanilla(id);

  res.json({ datos: planilla });
});

export const postEstudiante = asyncHandler(async (req, res) => {
  const input = req.body as CrearEstudianteInput;
  const estudiante = await crearEstudiante(input);

  res.status(201).json({ datos: estudiante });
});

export const putEstudiante = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del estudiante');
  const input = req.body as ActualizarEstudianteInput;
  const estudiante = await actualizarEstudiante(id, input);

  res.json({ datos: estudiante });
});

export const deleteEstudiante = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del estudiante');
  const resultado = await eliminarEstudiante(id);

  res.json({ datos: resultado });
});
