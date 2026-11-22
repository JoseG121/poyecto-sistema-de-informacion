# Núcleo Puerto de Altagracia · Control de Matrícula

Frontend de la aplicación de matrícula del núcleo musical **Puerto de Altagracia**. Consume la API real de `nucleo-server` (sin mocks) para gestionar estudiantes, representantes, instrumentos y asignaciones.

## Stack

| Área | Tecnología |
| --- | --- |
| Lenguaje | TypeScript (modo estricto) |
| UI | React 19 + Vite |
| Estilos | Tailwind CSS v4 |
| Componentes | Shadcn UI (Radix UI) |
| Estado global | React Context (`AuthContext`, `DataContext`, `ThemeProvider`) |
| Rutas | React Router |
| HTTP | Axios con interceptores JWT |
| Formularios | React Hook Form + Zod |
| PDF | jsPDF + jspdf-autotable (generación en el cliente) |
| Calidad | ESLint (flat config) |

## Requisitos

- Node.js 20.19+ o 22.12+
- npm 10+
- Backend `nucleo-server` en ejecución con PostgreSQL disponible

## Configuración

Copia `.env.example` a `.env`. La URL del backend es relativa para usar el proxy de Vite en desarrollo y preview:

```env
VITE_API_URL=/api
```

## Puesta en marcha

```bash
npm install
npm run dev
```

Frontend: <http://localhost:5173>  
Backend: <http://localhost:3001/api>

Para abrir la app desde el celular, usa la IP de la máquina en la misma red (por ejemplo `http://192.168.236.80:5173`). Las peticiones a `/api` son reenviadas por Vite a `http://127.0.0.1:3001`, así que no hace falta exponer el puerto 3001 ni configurar CORS para ese caso.

Si sirves `dist/` con otro servidor estático, ese servidor debe redirigir `/api` al backend. De lo contrario, define `VITE_API_URL` con la URL completa del backend y ajusta `CORS_ORIGIN`.

## Credenciales de demostración

El acceso se realiza con **cédula**, no con `username`.

| Rol | Cédula | Contraseña |
| --- | --- | --- |
| Administrador | `V-00000001` | `Admin123!` |
| Operador (solo lectura) | `V-00000002` | `Operador123!` |
| Clave de registro | — | `1234` |

El formulario de login incluye un botón para cargar automáticamente las credenciales de administrador.

## Roles y permisos

El backend aplica las restricciones reales (devuelve `403` cuando corresponde) y la interfaz oculta las acciones no permitidas:

| Acción | `admin` | `user` |
| --- | --- | --- |
| Consultar estudiantes, instrumentos y asignaciones | Sí | Sí |
| Generar planilla PDF | Sí | Sí |
| Registrar estudiantes e instrumentos | Sí | No |
| Editar / eliminar estudiantes | Sí | No |
| Asignar / liberar instrumentos | Sí | No |

Las rutas `/estudiantes/nuevo` y `/estudiantes/:id/editar`, y los botones de creación/edición/eliminación/asignación/liberación solo se muestran al rol `admin`.

## Contrato con el backend

Todas las respuestas exitosas usan el envelope `{ "datos": ... }`; las listas incluyen `meta`. Los errores llegan como `{ "error": { "mensaje", "detalles" } }` y se transforman en errores de campo del formulario.

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/autenticacion/registro` | Registro con `claveValidacion` |
| `POST` | `/autenticacion/login` | Login por cédula; devuelve `{ token, usuario }` |
| `GET` | `/autenticacion/perfil` | Usuario de la sesión |
| `POST` | `/autenticacion/logout` | Cierre de sesión |
| `GET` | `/estudiantes` | Lista de estudiantes |
| `GET` | `/estudiantes/:id` | Detalle de estudiante |
| `POST` | `/estudiantes` | Alta de estudiante con representantes |
| `PUT` | `/estudiantes/:id` | Edición de estudiante y representante |
| `DELETE` | `/estudiantes/:id` | Eliminación del estudiante (libera su instrumento) |
| `GET` | `/estudiantes/:id/planilla` | Datos de la planilla |
| `GET` | `/instrumentos` | Lista de instrumentos |
| `GET` | `/instrumentos/verificar-serial?serial=` | Disponibilidad en tiempo real del serial |
| `POST` | `/instrumentos` | Alta de instrumento |
| `POST` | `/instrumentos/asignar` | Asignación por `serial`, `marca` e `idEstudiante` |
| `POST` | `/instrumentos/:id/liberar` | Liberación del instrumento |

El token JWT se guarda en `localStorage` (`nucleo.auth.token`) y se adjunta como `Authorization: Bearer <token>`. Un `401` fuera de las rutas de autenticación cierra la sesión automáticamente.

## Funcionalidades

- **Autenticación:** registro con clave de validación, login por cédula, persistencia de sesión y rutas protegidas por rol.
- **Estudiantes:** alta y edición validadas con parentesco del representante, eliminación con liberación automática del instrumento, tabla/tarjetas responsive, búsqueda y ficha de detalle.
- **Instrumentos:** catálogo por categoría y verificación de serial único contra la API antes de guardar.
- **Asignaciones:** vinculación por estudiante y serial, prevención de conflictos y liberación.
- **Dashboard:** métricas de matrícula, cobertura instrumental y distribución por categoría.
- **PDF:** planilla de inscripción generada en el cliente con carga diferida.
- **Experiencia:** modo claro/oscuro, diseño responsive y notificaciones con Sonner.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Verificación de tipos + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | Ejecuta ESLint sobre todo el proyecto |
| `npm run typecheck` | Verificación de TypeScript sin emitir archivos |

## Estructura

```text
src/
├─ api/                 # Cliente HTTP, mappers y servicios por recurso
├─ components/          # Layout, componentes de negocio y primitivas UI
├─ context/             # AuthContext, DataContext y ThemeContext
├─ pages/               # Páginas de autenticación, dashboard y gestión
├─ types/               # DTOs del backend y tipos de dominio
└─ utils/               # Constantes, validadores, errores y generación de PDF
```

### Decisiones técnicas

- **Sin mocks:** el cliente apunta siempre al backend configurado en `VITE_API_URL`.
- **Tipado estricto:** `strict`, `noUncheckedIndexedAccess` y alias `@/*`.
- **Validación en dos capas:** Zod en el cliente y validación Zod del backend, con mapeo de `detalles.campo` a errores de formulario.
- **Serial único:** se normaliza a mayúsculas y se consulta al endpoint `verificar-serial` antes de guardar; el backend vuelve a validar la unicidad con restricción de base de datos.
- **Permisos dobles:** la UI oculta acciones según `rol` y el backend las vuelve a autorizar.
