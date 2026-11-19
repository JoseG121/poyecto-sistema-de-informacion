import type { Student } from '@/types/domain'
import type { StudentFormValues } from '@/utils/validators'

export function studentToFormValues(student: Student): StudentFormValues {
  const representative = student.representatives[0]

  return {
    studentCedula: student.studentCedula ?? '',
    firstName: student.firstName,
    lastName: student.lastName,
    studentDireccion: student.direccion ?? '',
    fechaNacimiento: student.fechaNacimiento ?? '',
    representativeCedula:
      representative?.cedula ?? student.representativeCedula ?? '',
    representativeFirstName:
      representative?.firstName ?? student.representativeFirstName,
    representativeLastName:
      representative?.lastName ?? student.representativeLastName,
    representativeDireccion: representative?.direccion ?? '',
    representativeTelefono: representative?.telefono ?? '',
    representativeCorreo: representative?.correo ?? '',
    parentesco: representative?.parentesco ?? 'Tutor',
  }
}
