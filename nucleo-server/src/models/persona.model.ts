import type { PoolClient, QueryResultRow } from 'pg';
import { pool } from '../db/pool';

interface PersonaRow extends QueryResultRow {
  id: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export interface Persona {
  id: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export interface PersonaData {
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export function mapPersona(row: PersonaRow): Persona {
  return {
    id: row.id,
    cedula: row.cedula,
    nombre: row.nombre,
    apellido: row.apellido,
    direccion: row.direccion,
  };
}

export async function createPersona(client: PoolClient, data: PersonaData): Promise<Persona> {
  const result = await client.query<PersonaRow>(
    `INSERT INTO persona (cedula, nombre, apellido, direccion)
     VALUES ($1, $2, $3, $4)
     RETURNING id, cedula, nombre, apellido, direccion`,
    [data.cedula, data.nombre, data.apellido, data.direccion],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('No se pudo registrar la persona');
  }

  return mapPersona(row);
}

export async function findPersonaByCedula(
  client: PoolClient,
  cedula: string,
): Promise<Persona | null> {
  const result = await client.query<PersonaRow>(
    'SELECT id, cedula, nombre, apellido, direccion FROM persona WHERE cedula = $1',
    [cedula],
  );

  const row = result.rows[0];
  return row ? mapPersona(row) : null;
}

export async function updatePersona(
  client: PoolClient,
  id: number,
  data: PersonaData,
): Promise<Persona> {
  const result = await client.query<PersonaRow>(
    `UPDATE persona
     SET cedula = $2, nombre = $3, apellido = $4, direccion = $5
     WHERE id = $1
     RETURNING id, cedula, nombre, apellido, direccion`,
    [id, data.cedula, data.nombre, data.apellido, data.direccion],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('No se pudo actualizar la persona');
  }

  return mapPersona(row);
}

export async function findPersonaById(id: number): Promise<Persona | null> {
  const result = await pool.query<PersonaRow>(
    'SELECT id, cedula, nombre, apellido, direccion FROM persona WHERE id = $1',
    [id],
  );

  const row = result.rows[0];
  return row ? mapPersona(row) : null;
}
