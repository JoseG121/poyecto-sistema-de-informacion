import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { authService } from '@/api/auth'
import { tokenStorage } from '@/utils/token-storage'
import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/types/domain'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  login: (input: LoginInput) => Promise<AuthSession>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'unauthenticated',
  )

  useEffect(() => {
    if (status !== 'loading') {
      return
    }

    let active = true

    authService
      .me()
      .then((currentUser) => {
        if (!active) {
          return
        }
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!active) {
          return
        }
        tokenStorage.clear()
        setUser(null)
        setStatus('unauthenticated')
      })

    return () => {
      active = false
    }
  }, [status])

  useEffect(() => {
    const handleUnauthorized = () => {
      tokenStorage.clear()
      setUser(null)
      setStatus('unauthenticated')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () =>
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const session = await authService.login(input)
    tokenStorage.set(session.token)
    setUser(session.user)
    setStatus('authenticated')
    return session
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    return authService.register(input)
  }, [])

  const logout = useCallback(() => {
    void authService.logout().catch(() => {})
    tokenStorage.clear()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      isAdmin: user?.rol === 'admin',
      login,
      register,
      logout,
    }),
    [user, status, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }

  return context
}
