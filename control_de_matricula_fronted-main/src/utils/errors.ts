import axios from 'axios'

import type { ApiError } from '@/types/api'

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  )
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }

  if (axios.isAxiosError(error)) {
    return 'No se pudo conectar con el servidor. Intenta nuevamente.'
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Ocurrió un error inesperado. Intenta nuevamente.'
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (isApiError(error) && error.fieldErrors) {
    return error.fieldErrors
  }

  return {}
}
