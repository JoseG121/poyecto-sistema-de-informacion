import type { PoolClient, QueryResultRow } from 'pg';
import type { Persona } from './persona.model';

interface RepresentanteRow extends QueryResultRow {
  id: number;
  correo: string | null;
  telefono: string | null;
  id_persona: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

export interface RepresentanteRecord {
  id: number;
  correo: string | null;
  telefono: string | null;
  idPersona: number;
  persona: Persona;
}

export interface RepresentanteData {
  idPersona: number;
  correo: string | null;
  telefono: string | null;
}

export interface RepresentanteVinculado {
  id: number;
  cedula: string | null;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  direccion: string | null;
  correo: string | null;
  telefono: string | null;
  parentesco: string;
}

const representanteColumns = `
  r.id,
  r.correo,
  r.telefono,
  r.id_persona,
  p.cedula,
  p.nombre,
  p.apellido,
  p.direccion
`;

const representanteFrom = 'FROM representante r JOIN persona p ON p.id = r.id_persona';

function mapRepresentante(row: RepresentanteRow): RepresentanteRecord {
  return {
    id: row.id,
    correo: row.correo,
    telefono: row.telefono,
    idPersona: row.id_persona,
    persona: {
      id: row.id_persona,
      cedula: row.cedula,
      nombre: row.nombre,
      apellido: row.apellido,
      direccion: row.direccion,
    },
  };
}

export async function findRepresentanteByPersona(
  client: PoolClient,
  idPersona: number,
): Promise<RepresentanteRecord | null> {
  const result = await client.query<RepresentanteRow>(
    `SELECT ${representanteColumns} ${representanteFrom} WHERE r.id_persona = $1`,
    [idPersona],
  );

  const row = result.rows[0];
  return row ? mapRepresentante(row) : null;
}

export async function createRepresentante(
  client: PoolClient,
  data: RepresentanteData,
): Promise<RepresentanteRecord> {
  const result = await client.query<RepresentanteRow>(
    `WITH inserted AS (
       INSERT INTO representante (correo, telefono, id_persona)
       VALUES ($1, $2, $3)
       RETURNING id, correo, telefono, id_persona
     )
     SELECT ${representanteColumns}
     FROM inserted r
     JOIN persona p ON p.id = r.id_persona`,
    [data.correo, data.telefono, data.idPersona],
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error('No se pudo registrar el representante');
  }

  return mapRepresentante(row);
}

export async function updateRepresentanteContacto(
  client: PoolClient,
  id: number,
  correo: string | null,
  telefono: string | null,
): Promise<void> {
  await client.query(
    `UPDATE representante
     SET correo = COALESCE($2, correo), telefono = COALESCE($3, telefono)
     WHERE id = $1`,
    [id, correo, telefono],
  );
}

export async function vincularRepresentante(
  client: PoolClient,
  idEstudiante: number,
  idRepresentante: number,
  parentesco: string,
): Promise<void> {
  await client.query(
    `INSERT INTO estudiante_representante (parentesco, id_estudiante, id_representante)
     VALUES ($1, $2, $3)`,
    [parentesco, idEstudiante, idRepresentante],
  );
}
