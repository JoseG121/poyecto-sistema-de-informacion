import type { InstrumentCategory } from './domain'

export interface ApiError {
  message: string
  status?: number
  code?: string
  fieldErrors?: Record<string, string>
}

export interface ApiDetalleError {
  campo?: string
  mensaje?: string
}

export interface ApiErrorResponse {
  error?: {
    mensaje?: string
    detalles?: ApiDetalleError[]
  }
  message?: string
  code?: string
  fieldErrors?: Record<string, string>
}

export interface ApiMeta {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
}

export interface ApiEnvelope<T> {
  datos: T
  meta?: ApiMeta
}

export interface BackendAuthUser {
  id: number
  idPersona: number
  cedula: string
  nombre: string
  apellido: string
  rol: 'admin' | 'user'
}

export interface BackendLoginResult {
  token: string
  usuario: BackendAuthUser
}

export interface BackendEstadoInstrumento {
  asignacion: 'disponible' | 'asignado'
  disponibilidad: boolean
}

export interface BackendInstrumentoDeEstudiante {
  id: number
  nombre: string
  marca: string
  serial: string
  categoria: InstrumentCategory
  estado: BackendEstadoInstrumento | null
}

export interface BackendRepresentante {
  id: number
  cedula: string | null
  nombre: string
  apellido: string
  nombreCompleto: string
  direccion: string | null
  correo: string | null
  telefono: string | null
  parentesco: string
}

export interface BackendEstudiante {
  id: number
  cedula: string | null
  nombre: string
  apellido: string
  nombreCompleto: string
  direccion: string | null
  fechaNacimiento: string | null
  fechaInscripcion: string
  instrumentoAsignado: boolean
  representantes: BackendRepresentante[]
  instrumento: BackendInstrumentoDeEstudiante | null
}

export interface BackendInstrumento {
  id: number
  nombre: string
  marca: string
  serial: string
  categoria: InstrumentCategory
  estado: BackendEstadoInstrumento | null
  estudiante: {
    id: number
    cedula: string | null
    nombreCompleto: string
  } | null
}

export interface SerialAvailabilityResult {
  serial: string
  disponible: boolean
}
