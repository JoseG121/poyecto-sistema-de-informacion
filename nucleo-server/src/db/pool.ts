import { Pool, types, type PoolClient } from 'pg';
import { env } from '../config/env';

types.setTypeParser(1700, (value) => Number(value));
// Las columnas DATE se devuelven como texto YYYY-MM-DD para no introducir zonas horarias.
types.setTypeParser(1082, (value) => value);

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error);
});

export async function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
