import { Client } from 'pg';
import { env } from '../config/env';
import { hashPassword } from '../utils/password';

interface PersonaDemo {
  cedula: string | null;
  nombre: string;
  apellido: string;
  direccion: string | null;
}

interface RepresentanteDemo extends PersonaDemo {
  cedula: string;
  correo: string | null;
  telefono: string | null;
  parentesco: string;
}

interface EstudianteDemo {
  persona: PersonaDemo;
  fechaNacimiento: string;
  fechaInscripcion: string;
  representantes: RepresentanteDemo[];
}

interface InstrumentoDemo {
  nombre: string;
  marca: string;
  serial: string;
  asignarA?: string;
}

const estudiantesDemo: EstudianteDemo[] = [
  {
    persona: {
      cedula: 'V-20123456',
      nombre: 'Ana Sofía',
      apellido: 'Pérez',
      direccion: 'Av. Principal, casa 12',
    },
    fechaNacimiento: '2012-05-10',
    fechaInscripcion: '2026-09-15',
    representantes: [
      {
        cedula: 'V-12345678',
        nombre: 'Carlos',
        apellido: 'Pérez',
        direccion: 'Av. Principal, casa 12',
        correo: 'carlos.perez@correo.com',
        telefono: '0414-1234567',
        parentesco: 'Padre',
      },
      {
        cedula: 'V-87654321',
        nombre: 'Laura',
        apellido: 'Pérez',
        direccion: 'Av. Principal, casa 12',
        correo: 'laura.perez@correo.com',
        telefono: '0414-7654321',
        parentesco: 'Madre',
      },
    ],
  },
  {
    persona: {
      cedula: 'V-20234567',
      nombre: 'Luis José',
      apellido: 'Rodríguez',
      direccion: 'Calle Miranda, casa 8',
    },
    fechaNacimiento: '2011-09-23',
    fechaInscripcion: '2026-09-20',
    representantes: [
      {
        cedula: 'V-23456789',
        nombre: 'María',
        apellido: 'Rodríguez',
        direccion: 'Calle Miranda, casa 8',
        correo: 'maria.rodriguez@correo.com',
        telefono: '0424-2345678',
        parentesco: 'Madre',
      },
    ],
  },
  {
    persona: {
      cedula: 'V-20345678',
      nombre: 'Camila Andrea',
      apellido: 'Martínez',
      direccion: 'Sector La Plaza, casa 3',
    },
    fechaNacimiento: '2013-02-14',
    fechaInscripcion: '2026-10-02',
    representantes: [
      {
        cedula: 'V-34567890',
        nombre: 'José',
        apellido: 'Martínez',
        direccion: 'Sector La Plaza, casa 3',
        correo: 'jose.martinez@correo.com',
        telefono: '0416-3456789',
        parentesco: 'Padre',
      },
    ],
  },
];

const instrumentosDemo: InstrumentoDemo[] = [
  { nombre: 'violín', marca: 'Stentor', serial: 'VN-001', asignarA: 'V-20123456' },
  { nombre: 'flauta', marca: 'Yamaha', serial: 'FL-100' },
  { nombre: 'trompeta', marca: 'Bach', serial: 'TP-500' },
  { nombre: 'tambor', marca: 'Latin Percussion', serial: 'PC-001' },
];

async function asegurarPersona(client: Client, persona: PersonaDemo): Promise<number> {
  if (persona.cedula) {
    const existente = await client.query<{ id: number }>(
      'SELECT id FROM persona WHERE cedula = $1',
      [persona.cedula],
    );

    if (existente.rows[0]) {
      return existente.rows[0].id;
    }
  }

  const insertada = await client.query<{ id: number }>(
    `INSERT INTO persona (cedula, nombre, apellido, direccion)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [persona.cedula, persona.nombre, persona.apellido, persona.direccion],
  );

  const id = insertada.rows[0]?.id;

  if (id === undefined) {
    throw new Error(`No se pudo registrar la persona ${persona.nombre} ${persona.apellido}`);
  }

  return id;
}

async function asegurarUsuario(
  client: Client,
  persona: PersonaDemo,
  contrasena: string,
  rol: 'admin' | 'user',
): Promise<void> {
  const idPersona = await asegurarPersona(client, persona);
  const hash = await hashPassword(contrasena);

  const existente = await client.query<{ id: number }>(
    'SELECT id FROM usuario WHERE id_persona = $1',
    [idPersona],
  );

  if (existente.rows[0]) {
    await client.query(
      `UPDATE usuario
       SET contrasena = $2, rol = $3, intentos_fallidos = 0
       WHERE id = $1`,
      [existente.rows[0].id, hash, rol],
    );
    return;
  }

  await client.query(
    `INSERT INTO usuario (contrasena, rol, id_persona)
     VALUES ($1, $2, $3)`,
    [hash, rol, idPersona],
  );
}

async function asegurarRepresentante(client: Client, representante: RepresentanteDemo): Promise<number> {
  const idPersona = await asegurarPersona(client, representante);

  const existente = await client.query<{ id: number }>(
    'SELECT id FROM representante WHERE id_persona = $1',
    [idPersona],
  );

  if (existente.rows[0]) {
    await client.query(
      `UPDATE representante
       SET correo = COALESCE($2, correo), telefono = COALESCE($3, telefono)
       WHERE id = $1`,
      [existente.rows[0].id, representante.correo, representante.telefono],
    );
    return existente.rows[0].id;
  }

  const insertado = await client.query<{ id: number }>(
    `INSERT INTO representante (correo, telefono, id_persona)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [representante.correo, representante.telefono, idPersona],
  );

  const id = insertado.rows[0]?.id;

  if (id === undefined) {
    throw new Error(`No se pudo registrar el representante ${representante.cedula}`);
  }

  return id;
}

async function asegurarEstudiante(
  client: Client,
  estudiante: EstudianteDemo,
): Promise<{ idEstudiante: number; idPersona: number }> {
  const idPersona = await asegurarPersona(client, estudiante.persona);

  const existente = await client.query<{ id: number }>(
    'SELECT id FROM estudiante WHERE id_persona = $1',
    [idPersona],
  );

  let idEstudiante = existente.rows[0]?.id;

  if (idEstudiante === undefined) {
    const insertado = await client.query<{ id: number }>(
      `INSERT INTO estudiante (fecha_nacimiento, fecha_inscripcion, id_persona)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [estudiante.fechaNacimiento, estudiante.fechaInscripcion, idPersona],
    );

    idEstudiante = insertado.rows[0]?.id;
  } else {
    await client.query(
      `UPDATE estudiante
       SET fecha_nacimiento = $2, fecha_inscripcion = $3
       WHERE id = $1`,
      [idEstudiante, estudiante.fechaNacimiento, estudiante.fechaInscripcion],
    );
  }

  if (idEstudiante === undefined) {
    throw new Error(`No se pudo registrar el estudiante ${estudiante.persona.cedula}`);
  }

  for (const representante of estudiante.representantes) {
    const idRepresentante = await asegurarRepresentante(client, representante);

    await client.query(
      `INSERT INTO estudiante_representante (parentesco, id_estudiante, id_representante)
       VALUES ($1, $2, $3)
       ON CONFLICT (id_estudiante, id_representante)
       DO UPDATE SET parentesco = EXCLUDED.parentesco`,
      [representante.parentesco, idEstudiante, idRepresentante],
    );
  }

  return { idEstudiante, idPersona };
}

async function asegurarInstrumento(
  client: Client,
  instrumento: InstrumentoDemo,
): Promise<number> {
  const insertado = await client.query<{ id: number }>(
    `INSERT INTO instrumento (nombre_instrumento, marca, serial)
     VALUES ($1, $2, $3)
     ON CONFLICT (serial) DO UPDATE
       SET nombre_instrumento = EXCLUDED.nombre_instrumento,
           marca = EXCLUDED.marca
     RETURNING id`,
    [instrumento.nombre, instrumento.marca, instrumento.serial],
  );

  const id = insertado.rows[0]?.id;

  if (id === undefined) {
    throw new Error(`No se pudo registrar el instrumento ${instrumento.serial}`);
  }

  await client.query(
    `INSERT INTO estado_instrumento (asignacion, disponibilidad, id_instrumento)
     VALUES ('disponible', TRUE, $1)
     ON CONFLICT (id_instrumento) DO NOTHING`,
    [id],
  );

  return id;
}

export async function seedDatabase(client: Client): Promise<void> {
  await client.query('BEGIN');

  try {
    await asegurarUsuario(
      client,
      {
        cedula: 'V-00000001',
        nombre: 'Administrador',
        apellido: 'del Núcleo',
        direccion: 'Sede del Núcleo',
      },
      'Admin123!',
      'admin',
    );

    await asegurarUsuario(
      client,
      {
        cedula: 'V-00000002',
        nombre: 'Operador',
        apellido: 'del Núcleo',
        direccion: 'Sede del Núcleo',
      },
      'Operador123!',
      'user',
    );

    const estudiantesPorCedula = new Map<string, number>();

    for (const estudiante of estudiantesDemo) {
      const { idEstudiante } = await asegurarEstudiante(client, estudiante);

      if (estudiante.persona.cedula) {
        estudiantesPorCedula.set(estudiante.persona.cedula, idEstudiante);
      }
    }

    for (const instrumento of instrumentosDemo) {
      const idInstrumento = await asegurarInstrumento(client, instrumento);

      if (!instrumento.asignarA) {
        continue;
      }

      const idEstudiante = estudiantesPorCedula.get(instrumento.asignarA);

      if (idEstudiante === undefined) {
        continue;
      }

      const vinculo = await client.query<{ id: number }>(
        `INSERT INTO estudiante_instrumento (id_estudiante, id_instrumento)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [idEstudiante, idInstrumento],
      );

      if (vinculo.rows[0]) {
        await client.query(
          `UPDATE estado_instrumento
           SET asignacion = 'asignado', disponibilidad = FALSE
           WHERE id_instrumento = $1`,
          [idInstrumento],
        );
      }
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function runSeed(): Promise<void> {
  const client = new Client({ connectionString: env.databaseUrl });
  await client.connect();

  try {
    await seedDatabase(client);
    console.log('Datos de demostración cargados correctamente.');
    console.log('Admin:    V-00000001 / Admin123!');
    console.log('Operador: V-00000002 / Operador123!');
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error('No se pudo ejecutar el seed:', error);
    process.exitCode = 1;
  });
}
