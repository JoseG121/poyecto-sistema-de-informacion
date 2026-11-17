import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';
import { env } from '../config/env';
import { seedDatabase } from './seed';

const shouldReset = process.argv.includes('--reset');

function databaseNameFromUrl(connectionString: string): string {
  const url = new URL(connectionString);
  const name = url.pathname.replace(/^\//, '');

  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(
      `El nombre de la base de datos "${name}" no es válido. Usa solo letras, números y guiones bajos.`,
    );
  }

  return name;
}

function maintenanceUrl(connectionString: string): string {
  const url = new URL(connectionString);
  url.pathname = '/postgres';
  return url.toString();
}

async function databaseExists(client: Client, name: string): Promise<boolean> {
  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  return result.rowCount === 1;
}

async function main(): Promise<void> {
  const databaseName = databaseNameFromUrl(env.databaseUrl);
  const admin = new Client({ connectionString: maintenanceUrl(env.databaseUrl) });

  try {
    await admin.connect();
  } catch (error) {
    console.error('No se pudo conectar a PostgreSQL con DATABASE_URL.');
    console.error('Revisa usuario, contraseña, host, puerto y que el servicio esté corriendo.');
    throw error;
  }

  try {
    const exists = await databaseExists(admin, databaseName);

    if (shouldReset && exists) {
      console.log(`Eliminando la base de datos ${databaseName}...`);
      await admin.query(
        'SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()',
        [databaseName],
      );
      await admin.query(`DROP DATABASE "${databaseName}"`);
    }

    if (!(await databaseExists(admin, databaseName))) {
      console.log(`Creando la base de datos ${databaseName}...`);
      await admin.query(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await admin.end();
  }

  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();

  try {
    const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');

    console.log('Aplicando schema...');
    await client.query(schema);

    console.log('Cargando datos de demostración...');
    await seedDatabase(client);

    console.log('Base de datos preparada correctamente.');
    console.log('Admin:    V-00000001 / Admin123!');
    console.log('Operador: V-00000002 / Operador123!');
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('\nNo se pudo preparar la base de datos.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
