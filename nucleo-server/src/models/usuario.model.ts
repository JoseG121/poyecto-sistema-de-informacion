import type { PoolClient, QueryResultRow } from 'pg';
import { pool } from '../db/pool';
import type { Rol } from '../types/auth';
import type { AuthUser } from '../types/auth';

interface UsuarioRow extends QueryResultRow {
  id: number;
  contrasena: string;
  intentos_fallidos: number;
  rol: Rol;
  id_persona: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export interface UsuarioRecord {
  id: number;
  contrasena: string;
  intentosFallidos: number;
  rol: Rol;
  idPersona: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export interface CreateUsuarioData {
  contrasena: string;
  rol: Rol;
  idPersona: number;
}

const usuarioColumns = `
  u.id,
  u.contrasena,
  u.intentos_fallidos,
  u.rol,
  u.id_persona,
  p.cedula,
  p.nombre,
  p.apellido,
  p.direccion
`;

const usuarioFrom = 'FROM usuario u JOIN persona p ON p.id = u.id_persona';

function mapUsuario(row: UsuarioRow): UsuarioRecord {
  return {
    id: row.id,
    contrasena: row.contrasena,
    intentosFallidos: row.intentos_fallidos,
    rol: row.rol,
    idPersona: row.id_persona,
    cedula: row.cedula,
    nombre: row.nombre,
    apellido: row.apellido,
    direccion: row.direccion,
  };
}

export function toAuthUser(usuario: UsuarioRecord): AuthUser {
  if (usuario.cedula === null) {
    throw new Error('La persona del usuario no tiene cédula registrada');
  }

  return {
    id: usuario.id,
    idPersona: usuario.idPersona,
    cedula: usuario.cedula,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
  };
}

export async function findUsuarioByCedula(cedula: string): Promise<UsuarioRecord | null> {
  const result = await pool.query<UsuarioRow>(
    `SELECT ${usuarioColumns} ${usuarioFrom} WHERE p.cedula = $1`,
    [cedula],
  );

  const row = result.rows[0];
  return row ? mapUsuario(row) : null;
}

export async function findUsuarioById(id: number): Promise<UsuarioRecord | null> {
  const result = await pool.query<UsuarioRow>(
    `SELECT ${usuarioColumns} ${usuarioFrom} WHERE u.id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row ? mapUsuario(row) : null;
}

export async function findUsuarioIdByPersona(
  client: PoolClient,
  idPersona: number,
): Promise<{ id: number } | null> {
  const result = await client.query<{ id: number }>(
    'SELECT id FROM usuario WHERE id_persona = $1',
    [idPersona],
  );

  return result.rows[0] ?? null;
}

export async function createUsuario(
  client: PoolClient,
  data: CreateUsuarioData,
): Promise<number> {
  const result = await client.query<{ id: number }>(
    `INSERT INTO usuario (contrasena, rol, id_persona)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [data.contrasena, data.rol, data.idPersona],
  );

  const inserted = result.rows[0];

  if (!inserted) {
    throw new Error('No se pudo registrar el usuario');
  }

  return inserted.id;
}

export async function incrementarIntentosFallidos(id: number): Promise<void> {
  await pool.query(
    'UPDATE usuario SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1',
    [id],
  );
}

export async function reiniciarIntentosFallidos(id: number): Promise<void> {
  await pool.query('UPDATE usuario SET intentos_fallidos = 0 WHERE id = $1', [id]);
}
