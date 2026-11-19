import { categoryLabels } from '../config/instrument-catalog';
import { withTransaction } from '../db/pool';
import {
  createEstudiante as createEstudianteRecord,
  deleteEstudiante,
  deleteRepresentantesByEstudiante,
  deleteVinculoInstrumentoByInstrumento,
  findEstudianteById,
  findEstudianteByIdForUpdate,
  findPersonaIdByEstudiante,
  findVinculoInstrumentoByEstudiante,
  listEstudiantes as listEstudianteRecords,
  updateEstudiante as updateEstudianteRecord,
  type Estudiante,
  type EstudianteListResult,
} from '../models/estudiante.model';
import { setEstadoInstrumento } from '../models/instrumento.model';
import {
  createPersona,
  deletePersona,
  findPersonaByCedula,
  updatePersona,
} from '../models/persona.model';
import {
  createRepresentante,
  findRepresentanteByPersona,
  setRepresentanteContacto,
  updateRepresentanteContacto,
  vincularRepresentante,
} from '../models/representante.model';
import { findUsuarioIdByPersona } from '../models/usuario.model';
import type {
  ActualizarEstudianteInput,
  CrearEstudianteInput,
  EstudianteListQuery,
} from '../schemas/estudiante.schema';
import { AppError } from '../utils/AppError';

export interface PlanillaCampo {
  etiqueta: string;
  valor: string;
}

export interface PlanillaPersona {
  cedula: string | null;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
}

export interface PlanillaRepresentante extends PlanillaPersona {
  parentesco: string;
  correo: string | null;
  telefono: string | null;
}

export interface PlanillaInstrumento {
  categoria: string;
  categoriaEtiqueta: string;
  nombre: string;
  marca: string;
  serial: string;
  estado: {
    asignacion: string;
    disponibilidad: boolean;
  } | null;
}

export interface Planilla {
  titulo: string;
  numeroPlanilla: string;
  fechaInscripcion: { iso: string; formateada: string };
  alumno: PlanillaPersona & { fechaNacimiento: string | null; direccion: string | null };
  representantes: PlanillaRepresentante[];
  instrumento: PlanillaInstrumento | null;
  estadoInstrumento: 'asignado' | 'pendiente';
  campos: PlanillaCampo[];
  firmas: string[];
}

const fechaFormatter = new Intl.DateTimeFormat('es-VE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'America/Caracas',
});

function formatearFecha(value: string): string {
  return fechaFormatter.format(new Date(`${value}T12:00:00Z`));
}

export async function crearEstudiante(input: CrearEstudianteInput): Promise<Estudiante> {
  const estudianteId = await withTransaction(async (client) => {
    if (input.estudiante.cedula) {
      const existente = await findPersonaByCedula(client, input.estudiante.cedula);

      if (existente) {
        throw new AppError(409, 'La cédula del estudiante ya está registrada en el sistema');
      }
    }

    const persona = await createPersona(client, {
      cedula: input.estudiante.cedula,
      nombre: input.estudiante.nombre,
      apellido: input.estudiante.apellido,
      direccion: input.estudiante.direccion,
    });

    const id = await createEstudianteRecord(client, {
      idPersona: persona.id,
      fechaNacimiento: input.estudiante.fechaNacimiento,
      fechaInscripcion: input.fechaInscripcion,
    });

    const representantesVinculados = new Set<number>();

    for (const representante of input.representantes) {
      let personaRepresentante = await findPersonaByCedula(client, representante.cedula);

      if (!personaRepresentante) {
        personaRepresentante = await createPersona(client, {
          cedula: representante.cedula,
          nombre: representante.nombre,
          apellido: representante.apellido,
          direccion: representante.direccion,
        });
      }

      let registro = await findRepresentanteByPersona(client, personaRepresentante.id);

      if (!registro) {
        registro = await createRepresentante(client, {
          idPersona: personaRepresentante.id,
          correo: representante.correo,
          telefono: representante.telefono,
        });
      } else if (representante.correo !== null || representante.telefono !== null) {
        await updateRepresentanteContacto(
          client,
          registro.id,
          representante.correo,
          representante.telefono,
        );
      }

      if (representantesVinculados.has(registro.id)) {
        throw new AppError(
          409,
          `El representante ${representante.cedula} está repetido en la solicitud`,
        );
      }

      representantesVinculados.add(registro.id);

      await vincularRepresentante(client, id, registro.id, representante.parentesco);
    }

    return id;
  });

  const estudiante = await findEstudianteById(estudianteId);

  if (!estudiante) {
    throw new AppError(500, 'No se pudo confirmar el estudiante registrado');
  }

  return estudiante;
}

export async function listarEstudiantes(
  query: EstudianteListQuery,
): Promise<EstudianteListResult> {
  return listEstudianteRecords({
    buscar: query.buscar,
    pagina: query.pagina,
    limite: query.limite,
    asignado: query.asignado,
  });
}

export async function obtenerEstudiante(id: number): Promise<Estudiante> {
  const estudiante = await findEstudianteById(id);

  if (!estudiante) {
    throw new AppError(404, 'Estudiante no encontrado');
  }

  return estudiante;
}

export async function obtenerPlanilla(id: number): Promise<Planilla> {
  const estudiante = await obtenerEstudiante(id);

  const instrumento: PlanillaInstrumento | null = estudiante.instrumento
    ? {
        categoria: estudiante.instrumento.categoria,
        categoriaEtiqueta: categoryLabels[estudiante.instrumento.categoria],
        nombre: estudiante.instrumento.nombre,
        marca: estudiante.instrumento.marca,
        serial: estudiante.instrumento.serial,
        estado: estudiante.instrumento.estado,
      }
    : null;

  const estadoInstrumento = instrumento ? 'asignado' : 'pendiente';

  const representantes: PlanillaRepresentante[] = estudiante.representantes.map(
    (representante) => ({
      cedula: representante.cedula,
      nombre: representante.nombre,
      apellido: representante.apellido,
      nombreCompleto: representante.nombreCompleto,
      parentesco: representante.parentesco,
      correo: representante.correo,
      telefono: representante.telefono,
    }),
  );

  const campos: PlanillaCampo[] = [
    { etiqueta: 'Cédula del alumno', valor: estudiante.cedula ?? 'No registrada' },
    { etiqueta: 'Nombres del alumno', valor: estudiante.nombre },
    { etiqueta: 'Apellidos del alumno', valor: estudiante.apellido },
    {
      etiqueta: 'Fecha de nacimiento',
      valor: estudiante.fechaNacimiento ? formatearFecha(estudiante.fechaNacimiento) : 'No registrada',
    },
    { etiqueta: 'Fecha de inscripción', valor: formatearFecha(estudiante.fechaInscripcion) },
    { etiqueta: 'Estado del instrumento', valor: instrumento ? 'Asignado' : 'Pendiente' },
  ];

  for (const representante of representantes) {
    campos.push({
      etiqueta: `Representante (${representante.parentesco})`,
      valor: representante.nombreCompleto,
    });
    campos.push({
      etiqueta: `Cédula del representante (${representante.parentesco})`,
      valor: representante.cedula ?? 'No registrada',
    });
  }

  if (instrumento) {
    campos.push(
      { etiqueta: 'Categoría del instrumento', valor: instrumento.categoriaEtiqueta },
      { etiqueta: 'Instrumento', valor: instrumento.nombre },
      { etiqueta: 'Marca', valor: instrumento.marca },
      { etiqueta: 'Serial', valor: instrumento.serial },
    );
  }

  return {
    titulo: 'Núcleo Puertos de Altagracia — Planilla de Inscripción',
    numeroPlanilla: `INS-${String(estudiante.id).padStart(4, '0')}`,
    fechaInscripcion: {
      iso: estudiante.fechaInscripcion,
      formateada: formatearFecha(estudiante.fechaInscripcion),
    },
    alumno: {
      cedula: estudiante.cedula,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      nombreCompleto: estudiante.nombreCompleto,
      fechaNacimiento: estudiante.fechaNacimiento,
      direccion: estudiante.direccion,
    },
    representantes,
    instrumento,
    estadoInstrumento,
    campos,
    firmas: ['Firma del representante', 'Firma del coordinador'],
  };
}

export async function actualizarEstudiante(
  id: number,
  input: ActualizarEstudianteInput,
): Promise<Estudiante> {
  await withTransaction(async (client) => {
    const estudiante = await findEstudianteByIdForUpdate(client, id);

    if (!estudiante) {
      throw new AppError(404, 'Estudiante no encontrado');
    }

    const personaVinculada = await findPersonaIdByEstudiante(client, id);

    if (!personaVinculada) {
      throw new AppError(404, 'Estudiante no encontrado');
    }

    if (input.estudiante.cedula) {
      const existente = await findPersonaByCedula(client, input.estudiante.cedula);

      if (existente && existente.id !== personaVinculada.id_persona) {
        throw new AppError(409, 'La cédula del estudiante ya está registrada en el sistema');
      }
    }

    await updatePersona(client, personaVinculada.id_persona, {
      cedula: input.estudiante.cedula,
      nombre: input.estudiante.nombre,
      apellido: input.estudiante.apellido,
      direccion: input.estudiante.direccion,
    });

    await updateEstudianteRecord(client, id, {
      fechaNacimiento: input.estudiante.fechaNacimiento,
      fechaInscripcion: input.fechaInscripcion,
    });

    const representante = input.representantes[0];

    if (!representante) {
      throw new AppError(400, 'Debes registrar un representante');
    }

    let personaRepresentante = await findPersonaByCedula(client, representante.cedula);

    if (!personaRepresentante) {
      personaRepresentante = await createPersona(client, {
        cedula: representante.cedula,
        nombre: representante.nombre,
        apellido: representante.apellido,
        direccion: representante.direccion,
      });
    } else {
      await updatePersona(client, personaRepresentante.id, {
        cedula: representante.cedula,
        nombre: representante.nombre,
        apellido: representante.apellido,
        direccion: representante.direccion,
      });
    }

    let registro = await findRepresentanteByPersona(client, personaRepresentante.id);

    if (!registro) {
      registro = await createRepresentante(client, {
        idPersona: personaRepresentante.id,
        correo: representante.correo,
        telefono: representante.telefono,
      });
    } else {
      await setRepresentanteContacto(
        client,
        registro.id,
        representante.correo,
        representante.telefono,
      );
    }

    await deleteRepresentantesByEstudiante(client, id);
    await vincularRepresentante(client, id, registro.id, representante.parentesco);
  });

  const estudiante = await findEstudianteById(id);

  if (!estudiante) {
    throw new AppError(500, 'No se pudo confirmar el estudiante actualizado');
  }

  return estudiante;
}

export async function eliminarEstudiante(id: number): Promise<{ id: number }> {
  await withTransaction(async (client) => {
    const estudiante = await findEstudianteByIdForUpdate(client, id);

    if (!estudiante) {
      throw new AppError(404, 'Estudiante no encontrado');
    }

    const personaVinculada = await findPersonaIdByEstudiante(client, id);

    if (!personaVinculada) {
      throw new AppError(404, 'Estudiante no encontrado');
    }

    const vinculo = await findVinculoInstrumentoByEstudiante(client, id);

    if (vinculo) {
      await deleteVinculoInstrumentoByInstrumento(client, vinculo.id_instrumento);
      await setEstadoInstrumento(client, vinculo.id_instrumento, 'disponible');
    }

    const usuario = await findUsuarioIdByPersona(client, personaVinculada.id_persona);

    if (usuario) {
      throw new AppError(
        409,
        'No se puede eliminar el estudiante porque su cédula está vinculada a un usuario del sistema',
      );
    }

    await deleteRepresentantesByEstudiante(client, id);
    await deleteEstudiante(client, id);
    await deletePersona(client, personaVinculada.id_persona);
  });

  return { id };
}
