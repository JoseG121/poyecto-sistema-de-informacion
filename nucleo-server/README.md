# Núcleo Musical Puertos de Altagracia — Backend

Backend REST API para la gestión de autenticación, estudiantes, representantes e instrumentos del Núcleo Musical Puertos de Altagracia.

Construido con **Node.js, Express 5, TypeScript, PostgreSQL, JWT, Bcrypt, Zod y Postman**.

## Tecnologías

- **Node.js 22+**
- **Express 5** — framework HTTP
- **TypeScript** — tipado estricto
- **PostgreSQL** — base de datos relacional
- **pg** — driver con consultas parametrizadas
- **jsonwebtoken** — autenticación JWT
- **bcryptjs** — hash de contraseñas
- **Zod** — validación de cuerpos y consultas
- **Helmet, CORS, Morgan, express-rate-limit** — seguridad, logging y límites de peticiones
- **tsx** — ejecución en desarrollo

## Arquitectura

El proyecto sigue una arquitectura MVC por capas:

```text
nucleo-server/
├── database/
│   └── schema.sql              # Tablas, CHECKs, FKs e índices
├── postman/
│   └── Nucleo-Altagracia.postman_collection.json
├── src/
│   ├── app.ts                  # Configuración de Express
│   ├── server.ts               # Arranque y cierre graceful
│   ├── config/
│   │   ├── env.ts              # Variables de entorno
│   │   └── instrument-catalog.ts
│   ├── controllers/            # Capa HTTP (request/response)
│   ├── services/               # Reglas de negocio y transacciones
│   ├── models/                 # Acceso a datos (SQL)
│   ├── routes/                 # Definición de endpoints
│   ├── schemas/                # Validaciones Zod
│   ├── middleware/             # JWT, roles, validación, errores
│   ├── db/                     # Pool, setup y seed
│   ├── types/                  # Tipos globales
│   └── utils/                  # JWT, bcrypt, AppError, helpers
├── .env.example
├── api.http
├── package.json
├── tsconfig.json
└── README.md
```

Flujo de una petición:

```text
ruta → middleware (autenticación/rol/Zod) → controlador → servicio → modelo → PostgreSQL
```

Los controladores no contienen `try/catch`; `asyncHandler` envía cualquier error al middleware global.

## Instalación

```powershell
cd nucleo-server
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `NODE_ENV` | Entorno | `development` |
| `PORT` | Puerto HTTP | `3001` |
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/nucleo_altagracia_db` |
| `JWT_SECRET` | Clave para firmar tokens | `clave_larga_y_segura` |
| `JWT_EXPIRES_IN` | Duración del token | `2h` |
| `CORS_ORIGIN` | Origen permitido del frontend | `http://localhost:5173` |
| `BCRYPT_ROUNDS` | Coste de bcrypt | `10` |
| `REGISTRATION_KEY` | Clave obligatoria para registrarse | `1234` |

> El puerto por defecto es `3001` para convivir con el backend existente en `3000`.

## Preparar la base de datos

```powershell
npm run db:setup
```

El script:

1. Crea la base de datos si no existe.
2. Aplica `database/schema.sql`.
3. Ejecuta el seed con usuarios, estudiantes, representantes e instrumentos de demostración.

Para reiniciar desde cero (destructivo):

```powershell
npm run db:reset
```

Solo el seed:

```powershell
npm run db:seed
```

Si aparece un error de autenticación (`password authentication failed for user "postgres"`), actualiza el usuario y la contraseña dentro de `DATABASE_URL` en `.env` con las credenciales reales de tu PostgreSQL local. El nombre de la base (`nucleo_altagracia_db`) puede mantenerse; `db:setup` la crea si no existe.

## Ejecutar

```powershell
npm run dev
```

API: `http://localhost:3001/api`

Health check: `GET http://localhost:3001/api/salud`

Compilar y ejecutar en producción:

```powershell
npm run build
npm start
```

Verificar tipos:

```powershell
npm run typecheck
```

## Cuentas de demostración

El login se realiza con la **cédula**, no con correo.

| Rol | Cédula | Contraseña |
|---|---|---|
| Administrador | `V-00000001` | `Admin123!` |
| Operador (solo lectura) | `V-00000002` | `Operador123!` |

## Permisos

| Acción | `admin` | `user` |
|---|---|---|
| Consultar estudiantes e instrumentos | Sí | Sí |
| Consultar planilla de inscripción | Sí | Sí |
| Registrar estudiantes | Sí | No |
| Registrar instrumentos | Sí | No |
| Asignar / liberar instrumentos | Sí | No |

Todas las rutas privadas requieren el header:

```http
Authorization: Bearer <token>
```

## Modelo de datos

El esquema se compone de ocho tablas:

```text
persona ──┬── usuario
          ├── representante ──┐
          └── estudiante ─────┼── estudiante_representante
                              └── estudiante_instrumento ── instrumento ── estado_instrumento
```

### `persona`

Datos personales compartidos.

| Campo | Descripción |
|---|---|
| `id` | PK |
| `cedula` | Cédula única (puede ser NULL para estudiantes sin cédula) |
| `nombre`, `apellido` | Nombres y apellidos |
| `direccion` | Dirección (opcional) |

### `usuario`

Credenciales de acceso al sistema. Un usuario se identifica por la cédula de su persona.

| Campo | Descripción |
|---|---|
| `contrasena` | Hash bcrypt |
| `intentos_fallidos` | Se incrementa con contraseña incorrecta y se reinicia al iniciar sesión correctamente |
| `rol` | `admin` o `user` |
| `id_persona` | FK única a `persona` |

### `representante`

| Campo | Descripción |
|---|---|
| `correo`, `telefono` | Datos de contacto opcionales |
| `id_persona` | FK única a `persona` |

Los representantes se reutilizan por cédula, de modo que dos hermanos pueden compartir el mismo representante.

### `estudiante`

| Campo | Descripción |
|---|---|
| `fecha_nacimiento` | Fecha opcional (`DATE`) |
| `fecha_inscripcion` | Fecha de inscripción (`DATE`, por defecto `CURRENT_DATE`) |
| `id_persona` | FK única a `persona` |

### `instrumento`

| Campo | Descripción |
|---|---|
| `nombre_instrumento` | Nombre validado por categoría |
| `marca` | Marca obligatoria |
| `serial` | Serial único (normalizado a mayúsculas) |

La categoría no se almacena: se deduce del nombre con el catálogo actual (`cuerda`, `madera`, `metal`, `percusion`).

### `estado_instrumento`

Relación 1:1 con `instrumento`.

| Campo | Descripción |
|---|---|
| `asignacion` | `disponible` o `asignado` |
| `disponibilidad` | Booleano sincronizado (`true` si está disponible) |
| `id_instrumento` | FK única a `instrumento` |

Un `CHECK` garantiza que `asignacion` y `disponibilidad` sean coherentes.

### `estudiante_representante`

| Campo | Descripción |
|---|---|
| `parentesco` | Ej. Padre, Madre, Tutor |
| `id_estudiante`, `id_representante` | FKs; la pareja es única |

### `estudiante_instrumento`

Relación 1:1 entre estudiante e instrumento.

| Campo | Descripción |
|---|---|
| `id_estudiante` | FK única |
| `id_instrumento` | FK única |

Un estudiante tiene como máximo un instrumento y un instrumento pertenece a un solo estudiante.

## Endpoints

Todas las respuestas exitosas usan `{ "datos": ... }`. Las listas agregan `meta`. Los errores usan:

```json
{
  "error": {
    "mensaje": "Mensaje",
    "detalles": [{ "campo": "campo", "mensaje": "Detalle" }]
  }
}
```

### Autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/autenticacion/registro` | Público | Registro con `claveValidacion` |
| POST | `/api/autenticacion/login` | Público | Login por cédula, devuelve JWT |
| GET | `/api/autenticacion/perfil` | JWT | Usuario de la sesión |
| POST | `/api/autenticacion/logout` | JWT | Cierre lógico de sesión |

Registro:

```json
{
  "cedula": "V-12345678",
  "nombre": "María",
  "apellido": "Pérez",
  "direccion": "Av. Principal, casa 12",
  "contrasena": "Maria123!",
  "claveValidacion": "1234",
  "rol": "user"
}
```

- `claveValidacion` debe coincidir con `REGISTRATION_KEY` (`1234` por defecto).
- `rol` es opcional (`user` por defecto).
- La cédula debe ser única.

Login:

```json
{
  "cedula": "V-00000001",
  "contrasena": "Admin123!"
}
```

Respuesta:

```json
{
  "datos": {
    "token": "eyJhbGciOi...",
    "usuario": {
      "id": 1,
      "idPersona": 1,
      "cedula": "V-00000001",
      "nombre": "Administrador",
      "apellido": "del Núcleo",
      "rol": "admin"
    }
  }
}
```

El JWT guarda `sub = usuario.id`, `cedula` y `rol`.

### Estudiantes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/estudiantes` | Admin | Registrar estudiante con representantes |
| GET | `/api/estudiantes` | JWT | Listar inscritos |
| GET | `/api/estudiantes/:id` | JWT | Detalle |
| GET | `/api/estudiantes/:id/planilla` | JWT | Planilla optimizada (JSON) |

Registro:

```json
{
  "estudiante": {
    "cedula": "V-20123456",
    "nombre": "Ana Sofía",
    "apellido": "Pérez",
    "direccion": "Av. Principal, casa 12",
    "fechaNacimiento": "2012-05-10"
  },
  "representantes": [
    {
      "cedula": "V-12345678",
      "nombre": "Carlos",
      "apellido": "Pérez",
      "direccion": "Av. Principal, casa 12",
      "correo": "carlos@correo.com",
      "telefono": "0414-1234567",
      "parentesco": "Padre"
    }
  ],
  "fechaInscripcion": "2026-11-17"
}
```

- `estudiante.cedula`: opcional.
- `representantes`: al menos uno; `parentesco` obligatorio.
- `fechaInscripcion`: opcional; por defecto la fecha actual.
- `direccion`, `correo`, `telefono` y `fechaNacimiento`: opcionales.
- Si el representante ya existe por cédula, se reutiliza y se actualizan sus datos de contacto.

Filtros de listado:

- `pagina` (default `1`)
- `limite` (default `20`, máximo `100`)
- `buscar` (alumno, cédula, representante, marca o serial)
- `asignado` (`true` / `false`)

Respuesta por estudiante:

```json
{
  "id": 1,
  "cedula": "V-20123456",
  "nombre": "Ana Sofía",
  "apellido": "Pérez",
  "nombreCompleto": "Ana Sofía Pérez",
  "direccion": "Av. Principal, casa 12",
  "fechaNacimiento": "2012-05-10",
  "fechaInscripcion": "2026-09-15",
  "instrumentoAsignado": true,
  "representantes": [
    {
      "id": 1,
      "cedula": "V-12345678",
      "nombre": "Carlos",
      "apellido": "Pérez",
      "nombreCompleto": "Carlos Pérez",
      "direccion": "Av. Principal, casa 12",
      "correo": "carlos@correo.com",
      "telefono": "0414-1234567",
      "parentesco": "Padre"
    }
  ],
  "instrumento": {
    "id": 1,
    "nombre": "violín",
    "marca": "Stentor",
    "serial": "VN-001",
    "categoria": "cuerda",
    "estado": {
      "asignacion": "asignado",
      "disponibilidad": false
    }
  }
}
```

La planilla devuelve título, número, fecha formateada, alumno, lista de representantes, instrumento, estado, campos listos para imprimir y firmas.

### Instrumentos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/instrumentos` | Admin | Registrar instrumento |
| GET | `/api/instrumentos` | JWT | Listar con filtros |
| GET | `/api/instrumentos/verificar-serial?serial=` | JWT | Comprobar si un serial está disponible en tiempo real |
| GET | `/api/instrumentos/:id` | JWT | Detalle |
| POST | `/api/instrumentos/asignar` | Admin | Asignar por serial + marca |
| POST | `/api/instrumentos/:id/liberar` | Admin | Liberar instrumento |

Registro:

```json
{
  "categoria": "cuerda",
  "nombre": "violín",
  "marca": "Stentor",
  "serial": "VN-001"
}
```

Categorías y nombres permitidos:

| Categoría | Nombres |
|---|---|
| `cuerda` | violín, viola, chelo, contrabajo, cuatro, guitarra |
| `madera` | flauta, oboe, clarinete, fagot |
| `metal` | trompeta, corno, trombón, tuba |
| `percusion` | texto libre (ej. tambor, redoblante, congas) |

La validación acepta variaciones de acentos y mayúsculas (`Violín`, `VIOLIN`, `percusión`) y guarda el nombre canónico. En percusión se conserva el texto enviado.

Verificación de serial en tiempo real (útil para el formulario del frontend):

```http
GET /api/instrumentos/verificar-serial?serial=VN-001
Authorization: Bearer <token>
```

```json
{
  "datos": {
    "serial": "VN-001",
    "disponible": false
  }
}
```

> Esta ruta se declara antes de `GET /api/instrumentos/:id` para que `verificar-serial` no se interprete como un ID.

Filtros de listado:

- `pagina`, `limite`
- `buscar` (nombre, marca o serial)
- `categoria`
- `estado` (`disponible` / `asignado`)

Asignación:

```json
{
  "serial": "VN-001",
  "marca": "Stentor",
  "idEstudiante": 1
}
```

Reglas:

1. El serial debe existir y la marca debe coincidir.
2. El instrumento debe estar disponible.
3. El estudiante no debe tener otro instrumento.
4. Se inserta el vínculo en `estudiante_instrumento`.
5. Se actualiza `estado_instrumento` a `asignado` / `false`.

La operación se ejecuta con transacción y bloqueo `FOR UPDATE` para evitar asignaciones simultáneas. Al liberar, se elimina el vínculo y el estado vuelve a `disponible` / `true`.

## Postman

Importa `postman/Nucleo-Altagracia.postman_collection.json`.

La colección incluye:

- Login de administrador y operador con scripts que guardan los tokens automáticamente.
- Registro, creación de estudiantes con representantes e instrumentos.
- Asignación con variables automáticas (`estudianteId`, `instrumentoId`, `serial`).
- Casos de error (clave inválida, categoría inválida, nombre inválido, serial duplicado, permisos).

También puedes usar `api.http` con la extensión **REST Client** de VS Code.

## Frontend

El proyecto `control_de_matricula_fronted-main` consume esta API directamente. Configura en su `.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

El frontend usa las mismas credenciales semilla y oculta las acciones de administrador para el rol `user`; el backend sigue siendo la autoridad y devuelve `403` ante cualquier intento no autorizado.

## Manejo de errores

El middleware global traduce:

| Situación | Código |
|---|---|
| Validación Zod | `400` |
| Clave de registro incorrecta | `400` |
| Sin token o token inválido | `401` |
| Cédula o contraseña incorrectas | `401` |
| Rol insuficiente | `403` |
| Recurso no encontrado | `404` |
| Cédula, serial o vínculo duplicado | `409` |
| Instrumento o estudiante ya asignado | `409` |
| Error inesperado | `500` |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga (`tsx watch`) |
| `npm run build` | Compila a `dist/` |
| `npm start` | Ejecuta compilado |
| `npm run typecheck` | Verifica tipos |
| `npm run db:setup` | Crea BD, aplica schema y seed |
| `npm run db:reset` | Reinicia BD desde cero (destructivo) |
| `npm run db:seed` | Solo datos de demostración |
