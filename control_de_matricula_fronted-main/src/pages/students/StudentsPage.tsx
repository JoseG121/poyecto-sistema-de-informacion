import { Guitar, Plus, Search, Users, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

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
    <div className="space-y-6">
      <PageHeader
        title="Estudiantes inscritos"
        description="Consulta los datos del alumno, su representante y el instrumento asignado."
        actions={
          isAdmin ? (
            <Button asChild>
              <Link to="/estudiantes/nuevo">
                <Plus className="size-4" />
                Nuevo estudiante
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Con instrumento</p>
          <p className="font-heading text-xl font-semibold">{withInstrument}</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Sin instrumento</p>
          <p className="font-heading text-xl font-semibold">
            {withoutInstrument}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, cédula o serial…"
            className="pl-9"
            aria-label="Buscar estudiantes"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Filtrar por instrumento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({students.length})</SelectItem>
            <SelectItem value="con">Con instrumento ({withInstrument})</SelectItem>
            <SelectItem value="sin">Sin instrumento ({withoutInstrument})</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
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
            />
          </div>
          <div className="md:hidden">
            <StudentsCards
              students={filteredStudents}
              onAssign={setAssignStudent}
              onUnassign={setUnassignStudent}
              onDownloadPdf={downloadPdf}
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
    </div>
  )
}
