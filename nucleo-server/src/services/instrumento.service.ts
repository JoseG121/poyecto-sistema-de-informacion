import { normalizeText } from '../config/instrument-catalog';
import { withTransaction } from '../db/pool';
import {
  findEstudianteByIdForUpdate,
  findVinculoInstrumentoByEstudiante,
  createVinculoInstrumento,
  deleteVinculoInstrumentoByInstrumento,
  type Estudiante,
} from '../models/estudiante.model';
import {
  createEstadoInstrumento,
  createInstrumento as createInstrumentoRecord,
  existeInstrumentoConSerial,
  findEstadoInstrumentoForUpdate,
  findInstrumentoById,
  findInstrumentoByIdForUpdate,
  findInstrumentoBySerialForUpdate,
  listInstrumentos as listInstrumentoRecords,
  setEstadoInstrumento,
  type Instrumento,
  type InstrumentoListResult,
} from '../models/instrumento.model';
import type {
  AsignarInstrumentoInput,
  CrearInstrumentoInput,
  InstrumentoListQuery,
} from '../schemas/instrumento.schema';
import { AppError } from '../utils/AppError';
import { obtenerEstudiante } from './estudiante.service';

export interface ResultadoAsignacion {
  estudiante: Estudiante;
  instrumento: Instrumento;
}

export async function crearInstrumento(input: CrearInstrumentoInput): Promise<Instrumento> {
  const instrumentoId = await withTransaction(async (client) => {
    const id = await createInstrumentoRecord(client, {
      nombre: input.nombre,
      marca: input.marca,
      serial: input.serial,
    });

    await createEstadoInstrumento(client, id);
    return id;
  });

  const instrumento = await findInstrumentoById(instrumentoId);

  if (!instrumento) {
    throw new AppError(500, 'No se pudo confirmar el instrumento registrado');
  }

  return instrumento;
}

export async function listarInstrumentos(
  query: InstrumentoListQuery,
): Promise<InstrumentoListResult> {
  return listInstrumentoRecords({
    buscar: query.buscar,
    categoria: query.categoria,
    estado: query.estado,
    pagina: query.pagina,
    limite: query.limite,
  });
}

export async function obtenerInstrumento(id: number): Promise<Instrumento> {
  const instrumento = await findInstrumentoById(id);

  if (!instrumento) {
    throw new AppError(404, 'Instrumento no encontrado');
  }

  return instrumento;
}

export async function verificarSerial(
  serial: string,
): Promise<{ serial: string; disponible: boolean }> {
  return {
    serial,
    disponible: !(await existeInstrumentoConSerial(serial)),
  };
}

export async function asignarInstrumento(
  input: AsignarInstrumentoInput,
): Promise<ResultadoAsignacion> {
  const ids = await withTransaction(async (client) => {
    const estudiante = await findEstudianteByIdForUpdate(client, input.idEstudiante);

    if (!estudiante) {
      throw new AppError(404, 'Estudiante no encontrado');
    }

    const instrumento = await findInstrumentoBySerialForUpdate(client, input.serial);

    if (!instrumento || normalizeText(instrumento.marca) !== normalizeText(input.marca)) {
      throw new AppError(404, 'No existe un instrumento con ese serial y marca');
    }

    const estado = await findEstadoInstrumentoForUpdate(client, instrumento.id);

    if (!estado || estado.asignacion !== 'disponible') {
      throw new AppError(409, 'El instrumento ya está asignado a un estudiante');
    }

    const vinculo = await findVinculoInstrumentoByEstudiante(client, estudiante.id);

    if (vinculo) {
      throw new AppError(409, 'El estudiante ya tiene un instrumento asignado');
    }

    await createVinculoInstrumento(client, estudiante.id, instrumento.id);
    await setEstadoInstrumento(client, instrumento.id, 'asignado');

    return {
      idEstudiante: estudiante.id,
      idInstrumento: instrumento.id,
    };
  });

  const [estudiante, instrumento] = await Promise.all([
    obtenerEstudiante(ids.idEstudiante),
    obtenerInstrumento(ids.idInstrumento),
  ]);

  return { estudiante, instrumento };
}

export async function liberarInstrumento(id: number): Promise<Instrumento> {
  await withTransaction(async (client) => {
    const instrumento = await findInstrumentoByIdForUpdate(client, id);

    if (!instrumento) {
      throw new AppError(404, 'Instrumento no encontrado');
    }

    const estado = await findEstadoInstrumentoForUpdate(client, id);

    if (!estado || estado.asignacion === 'disponible') {
      throw new AppError(409, 'El instrumento no está asignado a ningún estudiante');
    }

    await deleteVinculoInstrumentoByInstrumento(client, id);
    await setEstadoInstrumento(client, id, 'disponible');
  });

  return obtenerInstrumento(id);
}
