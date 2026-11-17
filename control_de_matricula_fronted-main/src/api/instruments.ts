import { api } from '@/api/http'
import { mapInstrumento } from '@/api/mappers'
import type {
  ApiEnvelope,
  BackendInstrumento,
  SerialAvailabilityResult,
} from '@/types/api'
import type { Instrument, InstrumentInput } from '@/types/domain'

export const instrumentsService = {
  async list(): Promise<Instrument[]> {
    const { data } = await api.get<ApiEnvelope<BackendInstrumento[]>>(
      '/instrumentos',
      { params: { pagina: 1, limite: 100 } },
    )

    return data.datos.map(mapInstrumento)
  },

  async create(input: InstrumentInput): Promise<Instrument> {
    const { data } = await api.post<ApiEnvelope<BackendInstrumento>>(
      '/instrumentos',
      {
        categoria: input.category,
        nombre: input.name,
        marca: input.brand,
        serial: input.serial,
      },
    )

    return mapInstrumento(data.datos)
  },

  async checkSerial(serial: string): Promise<boolean> {
    const { data } = await api.get<ApiEnvelope<SerialAvailabilityResult>>(
      '/instrumentos/verificar-serial',
      { params: { serial } },
    )

    return data.datos.disponible
  },
}
