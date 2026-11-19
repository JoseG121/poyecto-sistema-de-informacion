import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { assignmentsService } from '@/api/assignments'
import { instrumentsService } from '@/api/instruments'
import { studentsService } from '@/api/students'
import { getErrorMessage } from '@/utils/errors'
import type {
  AssignmentInput,
  Instrument,
  InstrumentInput,
  Student,
  StudentInput,
  StudentUpdateInput,
} from '@/types/domain'

interface DataContextValue {
  students: Student[]
  instruments: Instrument[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  createStudent: (input: StudentInput) => Promise<Student>
  updateStudent: (id: string, input: StudentUpdateInput) => Promise<Student>
  deleteStudent: (id: string) => Promise<void>
  createInstrument: (input: InstrumentInput) => Promise<Instrument>
  assignInstrument: (input: AssignmentInput) => Promise<void>
  unassignInstrument: (studentId: string) => Promise<void>
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([])
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      const [nextStudents, nextInstruments] = await Promise.all([
        studentsService.list(),
        instrumentsService.list(),
      ])
      setStudents(nextStudents)
      setInstruments(nextInstruments)
      setError(null)
    } catch (loadError) {
      setError(getErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Diferimos la carga inicial para no actualizar estado de forma síncrona
    // dentro del effect (evita renders en cascada).
    const handle = window.setTimeout(() => void refresh(), 0)

    return () => window.clearTimeout(handle)
  }, [refresh])

  const createStudent = useCallback(
    async (input: StudentInput) => {
      const student = await studentsService.create(input)
      await refresh()
      return student
    },
    [refresh],
  )

  const updateStudent = useCallback(
    async (id: string, input: StudentUpdateInput) => {
      const student = await studentsService.update(id, input)
      await refresh()
      return student
    },
    [refresh],
  )

  const deleteStudent = useCallback(
    async (id: string) => {
      await studentsService.remove(id)
      await refresh()
    },
    [refresh],
  )

  const createInstrument = useCallback(
    async (input: InstrumentInput) => {
      const instrument = await instrumentsService.create(input)
      await refresh()
      return instrument
    },
    [refresh],
  )

  const assignInstrument = useCallback(
    async (input: AssignmentInput) => {
      const instrument = instruments.find(
        (candidate) => candidate.serial === input.instrumentSerial,
      )

      if (!instrument) {
        throw new Error('No se encontró el instrumento seleccionado en el inventario.')
      }

      await assignmentsService.assign(input, instrument.brand)
      await refresh()
    },
    [instruments, refresh],
  )

  const unassignInstrument = useCallback(
    async (studentId: string) => {
      const student = students.find((candidate) => candidate.id === studentId)
      const instrumentId =
        student?.instrument?.id ??
        instruments.find((candidate) => candidate.assignedStudentId === studentId)
          ?.id

      if (!instrumentId) {
        throw new Error('El estudiante no tiene un instrumento asignado.')
      }

      await assignmentsService.unassign(instrumentId)
      await refresh()
    },
    [instruments, refresh, students],
  )

  const value = useMemo<DataContextValue>(
    () => ({
      students,
      instruments,
      isLoading,
      error,
      refresh,
      createStudent,
      updateStudent,
      deleteStudent,
      createInstrument,
      assignInstrument,
      unassignInstrument,
    }),
    [
      students,
      instruments,
      isLoading,
      error,
      refresh,
      createStudent,
      updateStudent,
      deleteStudent,
      createInstrument,
      assignInstrument,
      unassignInstrument,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextValue {
  const context = useContext(DataContext)

  if (!context) {
    throw new Error('useData debe usarse dentro de <DataProvider>')
  }

  return context
}
