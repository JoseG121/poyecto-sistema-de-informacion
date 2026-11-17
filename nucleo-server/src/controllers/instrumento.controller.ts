import {
  instrumentoListQuerySchema,
  verificarSerialQuerySchema,
} from '../schemas/instrumento.schema';
import type {
  AsignarInstrumentoInput,
  CrearInstrumentoInput,
} from '../schemas/instrumento.schema';
import {
  asignarInstrumento,
  crearInstrumento,
  liberarInstrumento,
  listarInstrumentos,
  obtenerInstrumento,
  verificarSerial,
} from '../services/instrumento.service';
import { asyncHandler } from '../utils/asyncHandler';
import { parseId } from '../utils/parseId';

export const getInstrumentos = asyncHandler(async (req, res) => {
  const query = instrumentoListQuerySchema.parse(req.query);
  const resultado = await listarInstrumentos(query);

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

export const getVerificarSerial = asyncHandler(async (req, res) => {
  const { serial } = verificarSerialQuerySchema.parse(req.query);
  const resultado = await verificarSerial(serial);

  res.json({ datos: resultado });
});

export const getInstrumentoById = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del instrumento');
  const instrumento = await obtenerInstrumento(id);

  res.json({ datos: instrumento });
});

export const postInstrumento = asyncHandler(async (req, res) => {
  const input = req.body as CrearInstrumentoInput;
  const instrumento = await crearInstrumento(input);

  res.status(201).json({ datos: instrumento });
});

export const postAsignarInstrumento = asyncHandler(async (req, res) => {
  const input = req.body as AsignarInstrumentoInput;
  const resultado = await asignarInstrumento(input);

  res.status(201).json({ datos: resultado });
});

export const postLiberarInstrumento = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, 'ID del instrumento');
  const instrumento = await liberarInstrumento(id);

  res.json({
    datos: {
      instrumento,
      mensaje: 'Instrumento liberado correctamente',
    },
  });
});
