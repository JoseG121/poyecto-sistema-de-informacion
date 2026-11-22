import { api } from '@/api/http'
import { mapEstudiante } from '@/api/mappers'
import type { ApiEnvelope, BackendEstudiante } from '@/types/api'
import type { Student, StudentInput, StudentUpdateInput } from '@/types/domain'
import { formatCedula, splitCedula } from '@/utils/cedula'

function normalizeCedula(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null
  }

  const { type, number } = splitCedula(value)

  if (!number) {
    return null
  }

  return formatCedula(type, number)
}

function buildPayload(input: StudentInput, fechaInscripcion?: string) {
  return {
    estudiante: {
      cedula: normalizeCedula(input.studentCedula),
      nombre: input.firstName.trim(),
      apellido: input.lastName.trim(),
      direccion: input.studentDireccion.trim(),
      fechaNacimiento: input.fechaNacimiento || null,
    },
    representantes: [
      {
        cedula: normalizeCedula(input.representativeCedula) ?? '',
        nombre: input.representativeFirstName.trim(),
        apellido: input.representativeLastName.trim(),
        direccion: input.representativeDireccion.trim(),
        correo: input.representativeCorreo?.trim() || null,
        telefono: input.representativeTelefono.trim(),
        parentesco: input.parentesco.trim(),
      },
    ],
    ...(fechaInscripcion ? { fechaInscripcion } : {}),
  }
}

export const studentsService = {
  async list(): Promise<Student[]> {
    const { data } = await api.get<ApiEnvelope<BackendEstudiante[]>>(
      '/estudiantes',
      { params: { pagina: 1, limite: 100 } },
    )

    return data.datos.map(mapEstudiante)
  },

  async getById(id: string): Promise<Student> {
    const { data } = await api.get<ApiEnvelope<BackendEstudiante>>(
      `/estudiantes/${encodeURIComponent(id)}`,
    )

    return mapEstudiante(data.datos)
  },

  async create(input: StudentInput): Promise<Student> {
    const { data } = await api.post<ApiEnvelope<BackendEstudiante>>(
      '/estudiantes',
      buildPayload(input),
    )

    return mapEstudiante(data.datos)
  },

  async update(id: string, input: StudentUpdateInput): Promise<Student> {
    const { data } = await api.put<ApiEnvelope<BackendEstudiante>>(
      `/estudiantes/${encodeURIComponent(id)}`,
      buildPayload(input, input.fechaInscripcion),
    )

    return mapEstudiante(data.datos)
  },

  async remove(id: string): Promise<void> {
    await api.delete<ApiEnvelope<{ id: number }>>(
      `/estudiantes/${encodeURIComponent(id)}`,
    )
  },
}
