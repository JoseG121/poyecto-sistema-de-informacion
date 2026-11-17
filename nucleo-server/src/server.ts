import { app } from './app';
import { env } from './config/env';
import { pool } from './db/pool';

interface PostgresError extends Error {
  code?: string;
}

function mensajeDeConexion(error: unknown): string | null {
  const pgError = error as PostgresError;

  if (pgError?.code === '28P01') {
    return [
      'No se pudo conectar a PostgreSQL: usuario o contraseña incorrectos.',
      'Revisa DATABASE_URL en nucleo-server/.env',
    ].join('\n');
  }

  if (pgError?.code === '3D000') {
    return [
      'No se pudo conectar a PostgreSQL: la base de datos no existe.',
      'Ejecuta primero: npm run db:setup',
    ].join('\n');
  }

  if (pgError?.code === 'ECONNREFUSED' || pgError?.code === 'ENOTFOUND') {
    return [
      'No se pudo conectar a PostgreSQL: el servidor no responde.',
      'Verifica que el servicio de PostgreSQL esté corriendo y que host y puerto en DATABASE_URL sean correctos.',
    ].join('\n');
  }

  return null;
}

async function start(): Promise<void> {
  await pool.query('SELECT 1');

  const server = app.listen(env.port, () => {
    console.log(`API disponible en http://localhost:${env.port}/api`);
  });

  const shutdown = (signal: string) => {
    console.log(`\nRecibido ${signal}. Cerrando servidor...`);
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  const mensaje = mensajeDeConexion(error);

  if (mensaje) {
    console.error(mensaje);
  } else {
    console.error('No se pudo iniciar el servidor:', error);
  }

  process.exit(1);
});
