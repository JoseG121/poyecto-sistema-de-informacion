export const INSTRUMENT_CATEGORIES = [
  'cuerda',
  'madera',
  'metal',
  'percusion',
] as const

export type InstrumentCategory = (typeof INSTRUMENT_CATEGORIES)[number]

export type InstrumentStatus = 'disponible' | 'asignado'

export type UserRole = 'admin' | 'user'

export interface Instrument {
  id: string
  category: InstrumentCategory
  name: string
  brand: string
  serial: string
  status: InstrumentStatus
  assignedStudentId: string | null
}

export interface StudentInstrument {
  id: string
  category: InstrumentCategory
  name: string
  brand: string
  serial: string
}

export interface Representative {
  id: string
  cedula: string | null
  firstName: string
  lastName: string
  parentesco: string
  correo: string | null
  telefono: string | null
}

export interface Student {
  id: string
  studentCedula: string | null
  representativeCedula: string
  firstName: string
  lastName: string
  representativeFirstName: string
  representativeLastName: string
  representatives: Representative[]
  enrollmentDate: string
  instrument: StudentInstrument | null
}

export interface StudentInput {
  studentCedula?: string
  representativeCedula: string
  firstName: string
  lastName: string
  representativeFirstName: string
  representativeLastName: string
  parentesco: string
}

export interface InstrumentInput {
  category: InstrumentCategory
  name: string
  brand: string
  serial: string
}

export interface AssignmentInput {
  studentId: string
  instrumentSerial: string
}

export interface AuthUser {
  id: string
  cedula: string
  nombre: string
  apellido: string
  rol: UserRole
}

export interface AuthSession {
  token: string
  user: AuthUser
}

export interface LoginInput {
  cedula: string
  contrasena: string
}

export interface RegisterInput {
  cedula: string
  nombre: string
  apellido: string
  contrasena: string
  claveValidacion: string
}

export interface DashboardStats {
  totalStudents: number
  totalInstruments: number
  availableInstruments: number
  assignedInstruments: number
  studentsWithoutInstrument: number
}
