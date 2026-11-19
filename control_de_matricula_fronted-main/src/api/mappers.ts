import type {
  BackendAuthUser,
  BackendEstudiante,
  BackendInstrumento,
  BackendRepresentante,
} from '@/types/api'
import type {
  AuthUser,
  Instrument,
  Representative,
  Student,
} from '@/types/domain'

export function mapAuthUser(usuario: BackendAuthUser): AuthUser {
  return {
    id: String(usuario.id),
    cedula: usuario.cedula,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
  }
}

export function mapInstrumento(instrumento: BackendInstrumento): Instrument {
  return {
    id: String(instrumento.id),
    category: instrumento.categoria,
    name: instrumento.nombre,
    brand: instrumento.marca,
    serial: instrumento.serial,
    status: instrumento.estado?.asignacion ?? 'disponible',
    assignedStudentId: instrumento.estudiante
      ? String(instrumento.estudiante.id)
      : null,
  }
}

export function mapRepresentante(
  representante: BackendRepresentante,
): Representative {
  return {
    id: String(representante.id),
    cedula: representante.cedula,
    firstName: representante.nombre,
    lastName: representante.apellido,
    direccion: representante.direccion,
    parentesco: representante.parentesco,
    correo: representante.correo,
    telefono: representante.telefono,
  }
}

export function mapEstudiante(estudiante: BackendEstudiante): Student {
  const representantes = Array.isArray(estudiante.representantes)
    ? estudiante.representantes
    : []
  const principal = representantes[0]
  const instrumento = estudiante.instrumento

  return {
    id: String(estudiante.id),
    studentCedula: estudiante.cedula,
    representativeCedula: principal?.cedula ?? '',
    firstName: estudiante.nombre,
    lastName: estudiante.apellido,
    direccion: estudiante.direccion,
    fechaNacimiento: estudiante.fechaNacimiento,
    representativeFirstName: principal?.nombre ?? '',
    representativeLastName: principal?.apellido ?? '',
    representatives: representantes.map(mapRepresentante),
    enrollmentDate: estudiante.fechaInscripcion,
    instrument: instrumento
      ? {
          id: String(instrumento.id),
          category: instrumento.categoria,
          name: instrumento.nombre,
          brand: instrumento.marca,
          serial: instrumento.serial,
        }
      : null,
  }
}
