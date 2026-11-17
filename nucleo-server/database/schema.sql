-- ============================================================
-- Núcleo Musical Puertos de Altagracia
-- Esquema de base de datos PostgreSQL
-- ============================================================

CREATE TABLE IF NOT EXISTS persona (
  id SERIAL PRIMARY KEY,
  cedula VARCHAR(30) UNIQUE,
  nombre VARCHAR(80) NOT NULL,
  apellido VARCHAR(80) NOT NULL,
  direccion VARCHAR(200),
  CONSTRAINT persona_nombre_not_blank_check CHECK (char_length(btrim(nombre)) > 0),
  CONSTRAINT persona_apellido_not_blank_check CHECK (char_length(btrim(apellido)) > 0),
  CONSTRAINT persona_cedula_not_blank_check CHECK (
    cedula IS NULL OR char_length(btrim(cedula)) > 0
  ),
  CONSTRAINT persona_cedula_uppercase_check CHECK (
    cedula IS NULL OR cedula = UPPER(cedula)
  )
);

CREATE TABLE IF NOT EXISTS usuario (
  id SERIAL PRIMARY KEY,
  contrasena TEXT NOT NULL,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0,
  rol VARCHAR(10) NOT NULL DEFAULT 'user',
  id_persona INTEGER NOT NULL UNIQUE REFERENCES persona(id) ON DELETE CASCADE,
  CONSTRAINT usuario_rol_check CHECK (rol IN ('admin', 'user')),
  CONSTRAINT usuario_intentos_fallidos_check CHECK (intentos_fallidos >= 0),
  CONSTRAINT usuario_contrasena_not_blank_check CHECK (char_length(contrasena) > 0)
);

CREATE TABLE IF NOT EXISTS representante (
  id SERIAL PRIMARY KEY,
  correo VARCHAR(160),
  telefono VARCHAR(30),
  id_persona INTEGER NOT NULL UNIQUE REFERENCES persona(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS estudiante (
  id SERIAL PRIMARY KEY,
  fecha_nacimiento DATE,
  fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
  id_persona INTEGER NOT NULL UNIQUE REFERENCES persona(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS instrumento (
  id SERIAL PRIMARY KEY,
  nombre_instrumento VARCHAR(80) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  serial VARCHAR(80) NOT NULL UNIQUE,
  CONSTRAINT instrumento_nombre_not_blank_check CHECK (
    char_length(btrim(nombre_instrumento)) > 0
  ),
  CONSTRAINT instrumento_marca_not_blank_check CHECK (char_length(btrim(marca)) > 0),
  CONSTRAINT instrumento_serial_not_blank_check CHECK (char_length(btrim(serial)) > 0),
  CONSTRAINT instrumento_serial_uppercase_check CHECK (serial = UPPER(serial))
);

CREATE TABLE IF NOT EXISTS estado_instrumento (
  id SERIAL PRIMARY KEY,
  asignacion VARCHAR(40) NOT NULL DEFAULT 'disponible',
  disponibilidad BOOLEAN NOT NULL DEFAULT TRUE,
  id_instrumento INTEGER NOT NULL UNIQUE REFERENCES instrumento(id) ON DELETE CASCADE,
  CONSTRAINT estado_instrumento_asignacion_check CHECK (
    asignacion IN ('disponible', 'asignado')
  ),
  CONSTRAINT estado_instrumento_consistencia_check CHECK (
    (asignacion = 'disponible' AND disponibilidad = TRUE)
    OR (asignacion = 'asignado' AND disponibilidad = FALSE)
  )
);

CREATE TABLE IF NOT EXISTS estudiante_representante (
  id SERIAL PRIMARY KEY,
  parentesco VARCHAR(50) NOT NULL,
  id_estudiante INTEGER NOT NULL REFERENCES estudiante(id) ON DELETE CASCADE,
  id_representante INTEGER NOT NULL REFERENCES representante(id) ON DELETE CASCADE,
  CONSTRAINT estudiante_representante_parentesco_not_blank_check CHECK (
    char_length(btrim(parentesco)) > 0
  ),
  CONSTRAINT estudiante_representante_pareja_unique UNIQUE (id_estudiante, id_representante)
);

CREATE TABLE IF NOT EXISTS estudiante_instrumento (
  id SERIAL PRIMARY KEY,
  id_estudiante INTEGER NOT NULL UNIQUE REFERENCES estudiante(id) ON DELETE CASCADE,
  id_instrumento INTEGER NOT NULL UNIQUE REFERENCES instrumento(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS persona_apellido_idx ON persona (apellido);
CREATE INDEX IF NOT EXISTS persona_cedula_idx ON persona (cedula);
CREATE INDEX IF NOT EXISTS estudiante_fecha_inscripcion_idx ON estudiante (fecha_inscripcion DESC);
CREATE INDEX IF NOT EXISTS instrumento_serial_idx ON instrumento (serial);
CREATE INDEX IF NOT EXISTS instrumento_nombre_idx ON instrumento (nombre_instrumento);
CREATE INDEX IF NOT EXISTS estudiante_representante_estudiante_idx
  ON estudiante_representante (id_estudiante);
CREATE INDEX IF NOT EXISTS estudiante_representante_representante_idx
  ON estudiante_representante (id_representante);
CREATE INDEX IF NOT EXISTS estado_instrumento_asignacion_idx
  ON estado_instrumento (asignacion);
CREATE INDEX IF NOT EXISTS estudiante_instrumento_instrumento_idx
  ON estudiante_instrumento (id_instrumento);
