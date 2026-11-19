import { Guitar, Plus, Search, Users, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { DeleteStudentDialog } from '@/components/shared/delete-student-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { UnassignDialog } from '@/components/shared/unassign-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AssignInstrumentDialog } from '@/components/assignments/AssignInstrumentDialog'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useEnrollmentPdf } from '@/utils/pdf/use-enrollment-pdf'
import {
  StudentsCards,
  StudentsTable,
  StudentsTableSkeleton,
} from '@/components/students/StudentsTable'
import { normalizeText } from '@/utils/utils'
import type { Student } from '@/types/domain'

type StatusFilter = 'todos' | 'con' | 'sin'

export default function StudentsPage() {
  const { isAdmin } = useAuth()
  const { students, isLoading, error, refresh } = useData()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [assignStudent, setAssignStudent] = useState<Student | null>(null)
  const [unassignStudent, setUnassignStudent] = useState<Student | null>(null)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const deferredQuery = useDeferredValue(query)
  const downloadPdf = useEnrollmentPdf()

  const withInstrument = students.filter(
    (student) => student.instrument !== null,
  ).length
  const withoutInstrument = students.length - withInstrument

  const filteredStudents = useMemo(() => {
    const search = normalizeText(deferredQuery)

    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'con' && student.instrument !== null) ||
        (statusFilter === 'sin' && student.instrument === null)

      if (!matchesStatus) {
        return false
      }

      if (!search) {
        return true
      }

      const haystack = normalizeText(
        [
          student.firstName,
          student.lastName,
          student.studentCedula ?? '',
          student.representativeFirstName,
          student.representativeLastName,
          student.representativeCedula,
          student.instrument?.name ?? '',
          student.instrument?.brand ?? '',
          student.instrument?.serial ?? '',
        ].join(' '),
      )

      return haystack.includes(search)
    })
  }, [students, statusFilter, deferredQuery])

  const hasFilters = query.trim().length > 0 || statusFilter !== 'todos'
  const showLoading = isLoading && students.length === 0

  const clearFilters = () => {
    setQuery('')
    setStatusFilter('todos')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Estudiantes inscritos"
        description="Consulta los datos del alumno, su representante y el instrumento asignado."
        actions={
          isAdmin ? (
            <Button asChild className="sm:w-auto">
              <Link to="/estudiantes/nuevo">
                <Plus className="size-4" />
                Nuevo estudiante
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-2 sm:max-w-md sm:gap-3">
        <div className="rounded-lg border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[11px] text-muted-foreground sm:text-xs">Con instrumento</p>
          <p className="font-heading text-lg font-semibold sm:text-xl">{withInstrument}</p>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[11px] text-muted-foreground sm:text-xs">Sin instrumento</p>
          <p className="font-heading text-lg font-semibold sm:text-xl">
            {withoutInstrument}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border bg-card p-2.5 shadow-sm sm:flex-row sm:items-center sm:gap-3 sm:p-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, cédula o serial…"
            className="h-9 pl-9 text-sm sm:h-10"
            aria-label="Buscar estudiantes"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="h-9 w-full text-sm sm:h-10 sm:w-52" aria-label="Filtrar por instrumento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({students.length})</SelectItem>
            <SelectItem value="con">Con instrumento ({withInstrument})</SelectItem>
            <SelectItem value="sin">Sin instrumento ({withoutInstrument})</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="justify-center" onClick={clearFilters}>
            <X className="size-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm" aria-live="polite">
          {filteredStudents.length}{' '}
          {filteredStudents.length === 1 ? 'estudiante' : 'estudiantes'}
          {hasFilters ? ' con los filtros aplicados' : ' en total'}
        </p>
        <Badge variant="outline" className="hidden sm:inline-flex">
          <Guitar className="size-3" />
          {withInstrument} asignaciones
        </Badge>
      </div>

      {error && students.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : showLoading ? (
        <StudentsTableSkeleton />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : Users}
          title={
            hasFilters
              ? 'No encontramos coincidencias'
              : 'Aún no hay estudiantes inscritos'
          }
          description={
            hasFilters
              ? 'Prueba con otro nombre, cédula o cambia el filtro de instrumento.'
              : 'Registra al primer estudiante para comenzar a construir la matrícula del núcleo.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button asChild>
                <Link to="/estudiantes/nuevo">
                  <Plus className="size-4" />
                  Registrar estudiante
                </Link>
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <StudentsTable
              students={filteredStudents}
              onAssign={setAssignStudent}
              onUnassign={setUnassignStudent}
              onDownloadPdf={downloadPdf}
              onDelete={setStudentToDelete}
            />
          </div>
          <div className="md:hidden">
            <StudentsCards
              students={filteredStudents}
              onAssign={setAssignStudent}
              onUnassign={setUnassignStudent}
              onDownloadPdf={downloadPdf}
              onDelete={setStudentToDelete}
            />
          </div>
        </>
      )}

      <AssignInstrumentDialog
        open={assignStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAssignStudent(null)
          }
        }}
        student={assignStudent}
      />

      <UnassignDialog
        student={unassignStudent}
        open={unassignStudent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setUnassignStudent(null)
          }
        }}
      />

      <DeleteStudentDialog
        student={studentToDelete}
        open={studentToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setStudentToDelete(null)
          }
        }}
      />
    </div>
  )
}
