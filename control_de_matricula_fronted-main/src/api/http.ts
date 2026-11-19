import axios, { type AxiosError } from 'axios'

import { tokenStorage } from '@/utils/token-storage'
import type { ApiError, ApiErrorResponse } from '@/types/api'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

const fieldAliases: Record<string, string> = {
  cedula: 'cedula',
  contrasena: 'contrasena',
  clavevalidacion: 'claveValidacion',
  nombre: 'nombre',
  apellido: 'apellido',
  direccion: 'direccion',
  'estudiante.cedula': 'studentCedula',
  'estudiante.nombre': 'firstName',
  'estudiante.apellido': 'lastName',
  'estudiante.direccion': 'studentDireccion',
  'estudiante.fechanacimiento': 'fechaNacimiento',
  'representantes.0.cedula': 'representativeCedula',
  'representantes.0.nombre': 'representativeFirstName',
  'representantes.0.apellido': 'representativeLastName',
  'representantes.0.direccion': 'representativeDireccion',
  'representantes.0.telefono': 'representativeTelefono',
  'representantes.0.correo': 'representativeCorreo',
  'representantes.0.parentesco': 'parentesco',
  idestudiante: 'studentId',
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

function normalizeField(campo: string, url: string): string {
  const key = campo
    .replace(/^representantes\.\d+\./, 'representantes.0.')
    .toLowerCase()

  if (url.includes('/instrumentos/asignar')) {
    if (key === 'serial' || key === 'marca') {
      return 'instrumentSerial'
    }
    if (key === 'idestudiante') {
      return 'studentId'
    }
  }

  if (url.includes('/instrumentos') && !url.includes('/asignar')) {
    if (key === 'nombre') return 'name'
    if (key === 'marca') return 'brand'
    if (key === 'serial') return 'serial'
    if (key === 'categoria') return 'category'
  }

  return fieldAliases[key] ?? campo
}

function buildFieldErrors(
  data: ApiErrorResponse | undefined,
  url: string,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {}

  if (data?.fieldErrors) {
    Object.assign(fieldErrors, data.fieldErrors)
  }

  for (const detalle of data?.error?.detalles ?? []) {
    if (!detalle.campo || !detalle.mensaje) {
      continue
    }

    const destino = normalizeField(detalle.campo, url)
    if (!fieldErrors[destino]) {
      fieldErrors[destino] = detalle.mensaje
    }
  }

  return fieldErrors
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const data = error.response?.data
    const isAuthEndpoint =
      url.includes('/autenticacion/login') ||
      url.includes('/autenticacion/registro')

    if (status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    const mensajeBackend = data?.error?.mensaje ?? data?.message
    const fieldErrors = buildFieldErrors(data, url)

    const apiError: ApiError = {
      message:
        mensajeBackend ??
        (status === 401
          ? 'Tu sesión expiró. Inicia sesión nuevamente.'
          : status
            ? 'No se pudo completar la operación.'
            : 'No se pudo conectar con el servidor. Verifica tu conexión.'),
      status,
      code: data?.code,
      fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
    }

    return Promise.reject(apiError)
  },
)
