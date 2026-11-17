import { api } from '@/api/http'
import { mapEstudiante } from '@/api/mappers'
import type { ApiEnvelope, BackendEstudiante } from '@/types/api'
import type { Student, StudentInput } from '@/types/domain'

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
      {
        estudiante: {
          cedula: input.studentCedula?.trim() || null,
          nombre: input.firstName.trim(),
          apellido: input.lastName.trim(),
        },
        representantes: [
          {
            cedula: input.representativeCedula.trim(),
            nombre: input.representativeFirstName.trim(),
            apellido: input.representativeLastName.trim(),
            parentesco: input.parentesco.trim() || 'Tutor',
          },
        ],
      },
    )

    return mapEstudiante(data.datos)
  },
}
