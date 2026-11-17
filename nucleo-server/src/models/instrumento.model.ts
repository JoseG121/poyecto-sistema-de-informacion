import type { PoolClient, QueryResultRow } from 'pg';
import { pool } from '../db/pool';
import {
  inferCategory,
  instrumentCatalog,
  type InstrumentCategory,
} from '../config/instrument-catalog';

interface InstrumentoRow extends QueryResultRow {
  id: number;
  nombre_instrumento: string;
  marca: string;
  serial: string;
  estado_asignacion: 'disponible' | 'asignado' | null;
  estado_disponibilidad: boolean | null;
  estudiante_id: number | null;
  estudiante_cedula: string | null;
  estudiante_nombre: string | null;
  estudiante_apellido: string | null;
}

interface CountRow extends QueryResultRow {
  count: number;
}

export interface EstadoInstrumento {
  asignacion: 'disponible' | 'asignado';
  disponibilidad: boolean;
}

export interface EstudianteDeInstrumento {
  id: number;
  cedula: string | null;
  nombreCompleto: string;
}

export interface Instrumento {
  id: number;
  nombre: string;
  marca: string;
  serial: string;
  categoria: InstrumentCategory;
  estado: EstadoInstrumento | null;
  estudiante: EstudianteDeInstrumento | null;
}

export interface InstrumentoLockRow {
  id: number;
  nombre_instrumento: string;
  marca: string;
  serial: string;
}

export interface CreateInstrumentoData {
  nombre: string;
  marca: string;
  serial: string;
}

export interface InstrumentoListParams {
  buscar?: string;
  categoria?: InstrumentCategory;
  estado?: 'disponible' | 'asignado';
  pagina: number;
  limite: number;
}

export interface InstrumentoListResult {
  items: Instrumento[];
  total: number;
}

const instrumentoSelect = `
  SELECT
    i.id,
    i.nombre_instrumento,
    i.marca,
    i.serial,
    est.asignacion AS estado_asignacion,
    est.disponibilidad AS estado_disponibilidad,
    e.id AS estudiante_id,
    p.cedula AS estudiante_cedula,
    p.nombre AS estudiante_nombre,
    p.apellido AS estudiante_apellido
  FROM instrumento i
  LEFT JOIN estado_instrumento est ON est.id_instrumento = i.id
  LEFT JOIN estudiante_instrumento ei ON ei.id_instrumento = i.id
  LEFT JOIN estudiante e ON e.id = ei.id_estudiante
  LEFT JOIN persona p ON p.id = e.id_persona
`;

const catalogNames = [
  ...instrumentCatalog.cuerda,
  ...instrumentCatalog.madera,
  ...instrumentCatalog.metal,
];

function mapInstrumento(row: InstrumentoRow): Instrumento {
  const estudiante =
    row.estudiante_id !== null && row.estudiante_nombre !== null && row.estudiante_apellido !== null
      ? {
          id: row.estudiante_id,
          cedula: row.estudiante_cedula,
          nombreCompleto: `${row.estudiante_nombre} ${row.estudiante_apellido}`.trim(),
        }
      : null;

  return {
    id: row.id,
    nombre: row.nombre_instrumento,
    marca: row.marca,
    serial: row.serial,
    categoria: inferCategory(row.nombre_instrumento),
    estado:
      row.estado_asignacion !== null && row.estado_disponibilidad !== null
        ? {
            asignacion: row.estado_asignacion,
            disponibilidad: row.estado_disponibilidad,
          }
        : null,
    estudiante,
  };
}

export async function listInstrumentos(
  params: InstrumentoListParams,
): Promise<InstrumentoListResult> {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (params.buscar) {
    values.push(`%${params.buscar}%`);
    const placeholder = `$${values.length}`;
    conditions.push(
      `(i.nombre_instrumento ILIKE ${placeholder}
        OR i.marca ILIKE ${placeholder}
        OR i.serial ILIKE ${placeholder})`,
    );
  }

  if (params.estado) {
    values.push(params.estado);
    conditions.push(`est.asignacion = $${values.length}`);
  }

  if (params.categoria === 'percusion') {
    values.push(catalogNames);
    conditions.push(`NOT (i.nombre_instrumento = ANY ($${values.length}::text[]))`);
  } else if (params.categoria) {
    values.push([...instrumentCatalog[params.categoria]]);
    conditions.push(`i.nombre_instrumento = ANY ($${values.length}::text[])`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query<CountRow>(
    `SELECT COUNT(*)::int AS count
     FROM instrumento i
     LEFT JOIN estado_instrumento est ON est.id_instrumento = i.id
     ${where}`,
    values,
  );

  const offset = (params.pagina - 1) * params.limite;
  const listValues = [...values, params.limite, offset];

  const result = await pool.query<InstrumentoRow>(
    `${instrumentoSelect}
     ${where}
     ORDER BY i.id DESC
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    listValues,
  );

  return {
    items: result.rows.map(mapInstrumento),
    total: countResult.rows[0]?.count ?? 0,
  };
}

export async function findInstrumentoById(id: number): Promise<Instrumento | null> {
  const result = await pool.query<InstrumentoRow>(`${instrumentoSelect} WHERE i.id = $1`, [id]);
  const row = result.rows[0];
  return row ? mapInstrumento(row) : null;
}

export async function existeInstrumentoConSerial(serial: string): Promise<boolean> {
  const result = await pool.query<{ existe: boolean }>(
    `SELECT EXISTS(SELECT 1 FROM instrumento WHERE serial = $1) AS existe`,
    [serial],
  );

  return result.rows[0]?.existe ?? false;
}

export async function createInstrumento(
  client: PoolClient,
  data: CreateInstrumentoData,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO instrumento (nombre_instrumento, marca, serial)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [data.nombre, data.marca, data.serial],
  );

  const inserted = result.rows[0];

  if (!inserted) {
    throw new Error('No se pudo registrar el instrumento');
  }

  return inserted.id;
}

export async function createEstadoInstrumento(
  client: PoolClient,
  idInstrumento: number,
): Promise<void> {
  await client.query(
    `INSERT INTO estado_instrumento (asignacion, disponibilidad, id_instrumento)
     VALUES ('disponible', TRUE, $1)`,
    [idInstrumento],
  );
}

export async function findInstrumentoBySerialForUpdate(
  client: PoolClient,
  serial: string,
): Promise<InstrumentoLockRow | null> {
  const result = await client.query<InstrumentoLockRow>(
    `SELECT id, nombre_instrumento, marca, serial
     FROM instrumento
     WHERE serial = $1
     FOR UPDATE`,
    [serial],
  );

  return result.rows[0] ?? null;
}

export async function findInstrumentoByIdForUpdate(
  client: PoolClient,
  id: number,
): Promise<InstrumentoLockRow | null> {
  const result = await client.query<InstrumentoLockRow>(
    `SELECT id, nombre_instrumento, marca, serial
     FROM instrumento
     WHERE id = $1
     FOR UPDATE`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function findEstadoInstrumentoForUpdate(
  client: PoolClient,
  idInstrumento: number,
): Promise<{ id: number; asignacion: 'disponible' | 'asignado' } | null> {
  const result = await client.query<{ id: number; asignacion: 'disponible' | 'asignado' }>(
    `SELECT id, asignacion
     FROM estado_instrumento
     WHERE id_instrumento = $1
     FOR UPDATE`,
    [idInstrumento],
  );

  return result.rows[0] ?? null;
}

export async function setEstadoInstrumento(
  client: PoolClient,
  idInstrumento: number,
  asignacion: 'disponible' | 'asignado',
): Promise<void> {
  await client.query(
    `UPDATE estado_instrumento
     SET asignacion = $2, disponibilidad = $3
     WHERE id_instrumento = $1`,
    [idInstrumento, asignacion, asignacion === 'disponible'],
  );
}
