import { STORAGE_KEYS } from '@/utils/constants'

export const tokenStorage = {
  get(): string | null {
    try {
      return window.localStorage.getItem(STORAGE_KEYS.token)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      window.localStorage.setItem(STORAGE_KEYS.token, token)
    } catch {
      // El almacenamiento puede estar bloqueado por el navegador.
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.token)
    } catch {
      // Ignorar.
    }
  },
}
