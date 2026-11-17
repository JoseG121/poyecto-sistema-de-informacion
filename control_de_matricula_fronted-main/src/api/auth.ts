import { api } from '@/api/http'
import { mapAuthUser } from '@/api/mappers'
import type {
  ApiEnvelope,
  BackendAuthUser,
  BackendLoginResult,
} from '@/types/api'
import type {
  AuthSession,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/types/domain'

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const { data } = await api.post<ApiEnvelope<BackendLoginResult>>(
      '/autenticacion/login',
      input,
    )

    return {
      token: data.datos.token,
      user: mapAuthUser(data.datos.usuario),
    }
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    const { data } = await api.post<
      ApiEnvelope<{ usuario: BackendAuthUser }>
    >('/autenticacion/registro', input)

    return mapAuthUser(data.datos.usuario)
  },

  async me(): Promise<AuthUser> {
    const { data } = await api.get<ApiEnvelope<BackendAuthUser>>(
      '/autenticacion/perfil',
    )

    return mapAuthUser(data.datos)
  },

  async logout(): Promise<void> {
    await api.post('/autenticacion/logout')
  },
}
