import { api } from '@/api/http'
import { mapEstudiante, mapInstrumento } from '@/api/mappers'
import type {
  ApiEnvelope,
  BackendEstudiante,
  BackendInstrumento,
} from '@/types/api'
import type { AssignmentInput, Instrument, Student } from '@/types/domain'

export interface AssignmentResult {
  student: Student
  instrument: Instrument
}

interface AssignmentBackendResult {
  estudiante: BackendEstudiante
  instrumento: BackendInstrumento
}

interface ReleaseBackendResult {
  instrumento: BackendInstrumento
  mensaje: string
}

export const assignmentsService = {
  async assign(
    input: AssignmentInput,
    marca: string,
  ): Promise<AssignmentResult> {
    const { data } = await api.post<ApiEnvelope<AssignmentBackendResult>>(
      '/instrumentos/asignar',
      {
        serial: input.instrumentSerial,
        marca,
        idEstudiante: Number(input.studentId),
      },
    )

    return {
      student: mapEstudiante(data.datos.estudiante),
      instrument: mapInstrumento(data.datos.instrumento),
    }
  },

  async unassign(instrumentId: string): Promise<Instrument> {
    const { data } = await api.post<ApiEnvelope<ReleaseBackendResult>>(
      `/instrumentos/${encodeURIComponent(instrumentId)}/liberar`,
    )

    return mapInstrumento(data.datos.instrumento)
  },
}
