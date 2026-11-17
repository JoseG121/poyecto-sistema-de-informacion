import type { PoolClient, QueryResultRow } from 'pg';
import { pool } from '../db/pool';
import { inferCategory, type InstrumentCategory } from '../config/instrument-catalog';
import type { RepresentanteVinculado } from './representante.model';

interface EstudianteRow extends QueryResultRow {
  id: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
  fecha_nacimiento: string | null;
  fecha_inscripcion: string;
  representantes: RepresentanteVinculado[];
  instrumento_id: number | null;
  instrumento_nombre: string | null;
  instrumento_marca: string | null;
  instrumento_serial: string | null;
  instrumento_asignacion: 'disponible' | 'asignado' | null;
  instrumento_disponibilidad: boolean | null;
}

interface CountRow extends QueryResultRow {
  count: number;
}

export interface InstrumentoDeEstudiante {
  id: number;
  nombre: string;
  marca: string;
  serial: string;
  categoria: InstrumentCategory;
  estado: {
    asignacion: 'disponible' | 'asignado';
    disponibilidad: boolean;
  } | null;
}

export interface Estudiante {
  id: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  direccion: string | null;
  fechaNacimiento: string | null;
  fechaInscripcion: string;
  instrumentoAsignado: boolean;
  representantes: RepresentanteVinculado[];
  instrumento: InstrumentoDeEstudiante | null;
}

export interface EstudianteListParams {
  buscar?: string;
  pagina: number;
  limite: number;
  asignado?: boolean;
}

export interface EstudianteListResult {
  items: Estudiante[];
  total: number;
}

export interface CreateEstudianteData {
  idPersona: number;
  fechaNacimiento: string | null;
  fechaInscripcion: string | null;
}

const estudianteSelect = `
  SELECT
    e.id,
    p.cedula,
    p.nombre,
    p.apellido,
    p.direccion,
    e.fecha_nacimiento,
    e.fecha_inscripcion,
    COALESCE((
      SELECT json_agg(json_build_object(
        'id', r.id,
        'cedula', pr.cedula,
        'nombre', pr.nombre,
        'apellido', pr.apellido,
        'direccion', pr.direccion,
        'correo', r.correo,
        'telefono', r.telefono,
        'parentesco', er.parentesco
      ) ORDER BY er.id)
      FROM estudiante_representante er
      JOIN representante r ON r.id = er.id_representante
      JOIN persona pr ON pr.id = r.id_persona
      WHERE er.id_estudiante = e.id
    ), '[]'::json) AS representantes,
    i.id AS instrumento_id,
    i.nombre_instrumento AS instrumento_nombre,
    i.marca AS instrumento_marca,
    i.serial AS instrumento_serial,
    est.asignacion AS instrumento_asignacion,
    est.disponibilidad AS instrumento_disponibilidad
  FROM estudiante e
  JOIN persona p ON p.id = e.id_persona
  LEFT JOIN estudiante_instrumento ei ON ei.id_estudiante = e.id
  LEFT JOIN instrumento i ON i.id = ei.id_instrumento
  LEFT JOIN estado_instrumento est ON est.id_instrumento = i.id
`;

function mapInstrumento(row: EstudianteRow): InstrumentoDeEstudiante | null {
  if (
    row.instrumento_id === null ||
    row.instrumento_nombre === null ||
    row.instrumento_marca === null ||
    row.instrumento_serial === null
  ) {
    return null;
  }

  return {
    id: row.instrumento_id,
    nombre: row.instrumento_nombre,
    marca: row.instrumento_marca,
    serial: row.instrumento_serial,
    categoria: inferCategory(row.instrumento_nombre),
    estado:
      row.instrumento_asignacion !== null && row.instrumento_disponibilidad !== null
        ? {
            asignacion: row.instrumento_asignacion,
            disponibilidad: row.instrumento_disponibilidad,
          }
        : null,
  };
}

function mapEstudiante(row: EstudianteRow): Estudiante {
  const instrumento = mapInstrumento(row);
  const representantes = Array.isArray(row.representantes) ? row.representantes : [];

  return {
    id: row.id,
    cedula: row.cedula,
    nombre: row.nombre,
    apellido: row.apellido,
    nombreCompleto: `${row.nombre} ${row.apellido}`.trim(),
    direccion: row.direccion,
    fechaNacimiento: row.fecha_nacimiento,
    fechaInscripcion: row.fecha_inscripcion,
    instrumentoAsignado: instrumento !== null,
    representantes: representantes.map((representante) => ({
      ...representante,
      nombreCompleto: `${representante.nombre} ${representante.apellido}`.trim(),
    })),
    instrumento,
  };
}

export async function listEstudiantes(
  params: EstudianteListParams,
): Promise<EstudianteListResult> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.buscar) {
    values.push(`%${params.buscar}%`);
    const placeholder = `$${values.length}`;

    conditions.push(`(
      p.nombre ILIKE ${placeholder}
      OR p.apellido ILIKE ${placeholder}
      OR COALESCE(p.cedula, '') ILIKE ${placeholder}
      OR COALESCE(i.serial, '') ILIKE ${placeholder}
      OR COALESCE(i.marca, '') ILIKE ${placeholder}
      OR EXISTS (
        SELECT 1
        FROM estudiante_representante erb
        JOIN representante rb ON rb.id = erb.id_representante
        JOIN persona prb ON prb.id = rb.id_persona
        WHERE erb.id_estudiante = e.id
          AND (
            prb.nombre ILIKE ${placeholder}
            OR prb.apellido ILIKE ${placeholder}
            OR COALESCE(prb.cedula, '') ILIKE ${placeholder}
          )
      )
    )`);
  }

  if (params.asignado !== undefined) {
    conditions.push(
      params.asignado
        ? 'EXISTS (SELECT 1 FROM estudiante_instrumento eif WHERE eif.id_estudiante = e.id)'
        : 'NOT EXISTS (SELECT 1 FROM estudiante_instrumento eif WHERE eif.id_estudiante = e.id)',
    );
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<CountRow>(
    `SELECT COUNT(*)::int AS count
     FROM estudiante e
     JOIN persona p ON p.id = e.id_persona
     LEFT JOIN estudiante_instrumento ei ON ei.id_estudiante = e.id
     LEFT JOIN instrumento i ON i.id = ei.id_instrumento
     ${where}`,
    values,
  );

  const offset = (params.pagina - 1) * params.limite;
  const listValues = [...values, params.limite, offset];

  const result = await pool.query<EstudianteRow>(
    `${estudianteSelect}
     ${where}
     ORDER BY e.fecha_inscripcion DESC, e.id DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    listValues,
  );

  return {
    items: result.rows.map(mapEstudiante),
    total: countResult.rows[0]?.count ?? 0,
  };
}

export async function findEstudianteById(id: number): Promise<Estudiante | null> {
  const result = await pool.query<EstudianteRow>(`${estudianteSelect} WHERE e.id = $1`, [id]);
  const row = result.rows[0];
  return row ? mapEstudiante(row) : null;
}

export async function createEstudiante(
  client: PoolClient,
  data: CreateEstudianteData,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO estudiante (fecha_nacimiento, fecha_inscripcion, id_persona)
     VALUES ($1, COALESCE($2::date, CURRENT_DATE), $3)
     RETURNING id`,
    [data.fechaNacimiento, data.fechaInscripcion, data.idPersona],
  );

  const inserted = result.rows[0];

  if (!inserted) {
    throw new Error('No se pudo registrar el estudiante');
  }

  return inserted.id;
}

export async function findEstudianteByIdForUpdate(
  client: PoolClient,
  id: number,
): Promise<{ id: number } | null> {
  const result = await client.query<{ id: number }>(
    'SELECT id FROM estudiante WHERE id = $1 FOR UPDATE',
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findVinculoInstrumentoByEstudiante(
  client: PoolClient,
  idEstudiante: number,
): Promise<{ id: number; id_instrumento: number } | null> {
  const result = await client.query<{ id: number; id_instrumento: number }>(
    `SELECT id, id_instrumento
     FROM estudiante_instrumento
     WHERE id_estudiante = $1
     FOR UPDATE`,
    [idEstudiante],
  );

  return result.rows[0] ?? null;
}

export async function createVinculoInstrumento(
  client: PoolClient,
  idEstudiante: number,
  idInstrumento: number,
): Promise<void> {
  await client.query(
    `INSERT INTO estudiante_instrumento (id_estudiante, id_instrumento)
     VALUES ($1, $2)`,
    [idEstudiante, idInstrumento],
  );
}

export async function deleteVinculoInstrumentoByInstrumento(
  client: PoolClient,
  idInstrumento: number,
): Promise<void> {
  await client.query('DELETE FROM estudiante_instrumento WHERE id_instrumento = $1', [
    idInstrumento,
  ]);
}
