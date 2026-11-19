import { Guitar, LayoutGrid, Link2, List, Plus, Search, X } from 'lucide-react'
import { useDeferredValue, useMemo, useState } from 'react'

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
import { InstrumentCard } from '@/components/instruments/InstrumentCard'
import { InstrumentList } from '@/components/instruments/InstrumentList'
import { InstrumentsTable } from '@/components/instruments/InstrumentsTable'
import { NewInstrumentDialog } from '@/components/instruments/NewInstrumentDialog'
import {
  INSTRUMENT_CATEGORIES,
  INSTRUMENT_CATEGORY_LABELS,
} from '@/utils/constants'
import { fullName, normalizeText } from '@/utils/utils'
import type {
  Instrument,
  InstrumentCategory,
  Student,
} from '@/types/domain'

type CategoryFilter = 'todas' | InstrumentCategory
type StatusFilter = 'todos' | 'disponible' | 'asignado'
type ViewMode = 'cards' | 'list'

export default function InstrumentsPage() {
  const { isAdmin } = useAuth()
  const { instruments, students, isLoading, error, refresh } = useData()
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilter>('todas')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [view, setView] = useState<ViewMode>('cards')
  const [newInstrumentOpen, setNewInstrumentOpen] = useState(false)
  const [assignInstrument, setAssignInstrument] = useState<Instrument | null>(
    null,
  )
  const [unassignStudent, setUnassignStudent] = useState<Student | null>(null)
  const deferredQuery = useDeferredValue(query)

  const available = instruments.filter(
    (instrument) => instrument.status === 'disponible',
  ).length
  const assigned = instruments.length - available

  const studentNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const student of students) {
      map.set(student.id, fullName(student.firstName, student.lastName))
    }
    return map
  }, [students])

  const filteredInstruments = useMemo(() => {
    const search = normalizeText(deferredQuery)

    return instruments.filter((instrument) => {
      const matchesCategory =
        categoryFilter === 'todas' || instrument.category === categoryFilter
      const matchesStatus =
        statusFilter === 'todos' || instrument.status === statusFilter

      if (!matchesCategory || !matchesStatus) {
        return false
      }

      if (!search) {
        return true
      }

      const assignedName = instrument.assignedStudentId
        ? studentNames.get(instrument.assignedStudentId) ?? ''
        : ''
      const haystack = normalizeText(
        [
          instrument.name,
          instrument.brand,
          instrument.serial,
          INSTRUMENT_CATEGORY_LABELS[instrument.category],
          assignedName,
        ].join(' '),
      )

      return haystack.includes(search)
    })
  }, [
    instruments,
    categoryFilter,
    statusFilter,
    deferredQuery,
    studentNames,
  ])

  const hasFilters =
    query.trim().length > 0 ||
    categoryFilter !== 'todas' ||
    statusFilter !== 'todos'
  const showLoading = isLoading && instruments.length === 0

  const clearFilters = () => {
    setQuery('')
    setCategoryFilter('todas')
    setStatusFilter('todos')
  }

  const handleUnassign = (instrument: Instrument) => {
    const student = students.find(
      (candidate) => candidate.id === instrument.assignedStudentId,
    )
    setUnassignStudent(student ?? null)
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <PageHeader
        title="Instrumentos"
        description="Inventario del núcleo organizado por categoría, con marca y serial único por instrumento."
        actions={
          isAdmin ? (
            <Button onClick={() => setNewInstrumentOpen(true)} className="sm:w-auto">
              <Plus className="size-4" />
              Nuevo instrumento
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-2 sm:max-w-lg sm:gap-3">
        <div className="rounded-lg border bg-card px-2.5 py-2 sm:px-4 sm:py-3">
          <p className="text-[10px] text-muted-foreground sm:text-xs">Total</p>
          <p className="font-heading text-lg font-semibold sm:text-xl">
            {instruments.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-2.5 py-2 sm:px-4 sm:py-3">
          <p className="text-[10px] text-muted-foreground sm:text-xs">Disponibles</p>
          <p className="font-heading text-lg font-semibold text-emerald-600 dark:text-emerald-400 sm:text-xl">
            {available}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-2.5 py-2 sm:px-4 sm:py-3">
          <p className="text-[10px] text-muted-foreground sm:text-xs">Asignados</p>
          <p className="font-heading text-lg font-semibold text-amber-600 dark:text-amber-400 sm:text-xl">
            {assigned}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border bg-card p-2.5 shadow-sm sm:gap-3 sm:p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por instrumento, marca o serial…"
            className="pl-9"
            aria-label="Buscar instrumentos"
          />
        </div>

        <Select
          value={categoryFilter}
          onValueChange={(value) =>
            setCategoryFilter(value as CategoryFilter)
          }
        >
          <SelectTrigger className="w-full lg:w-44" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {INSTRUMENT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {INSTRUMENT_CATEGORY_LABELS[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full lg:w-40" aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="disponible">Disponibles</SelectItem>
            <SelectItem value="asignado">Asignados</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground sm:text-sm" aria-live="polite">
          {filteredInstruments.length}{' '}
          {filteredInstruments.length === 1 ? 'instrumento' : 'instrumentos'}
          {hasFilters ? ' con filtros' : ' en inventario'}
        </p>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="hidden md:inline-flex">
            <Guitar className="size-3" />
            Serial único validado
          </Badge>
          <div
            className="inline-flex items-center rounded-lg border bg-card p-0.5 shadow-sm sm:p-1"
            role="group"
            aria-label="Cambiar vista de instrumentos"
          >
            <Button
              type="button"
              variant={view === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 sm:px-2.5"
              onClick={() => setView('cards')}
              aria-pressed={view === 'cards'}
              aria-label="Vista de tarjetas"
              title="Vista de tarjetas"
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">Tarjetas</span>
            </Button>
            <Button
              type="button"
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2 sm:px-2.5"
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
              aria-label="Vista de lista"
              title="Vista de lista"
            >
              <List className="size-4" />
              <span className="hidden sm:inline">Lista</span>
            </Button>
          </div>
        </div>
      </div>

      {error && instruments.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : showLoading ? (
        view === 'cards' ? (
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 animate-pulse rounded-xl border bg-card sm:h-64"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse bg-muted/20" />
              ))}
            </div>
          </div>
        )
      ) : filteredInstruments.length === 0 ? (
        <EmptyState
          icon={hasFilters ? Search : Guitar}
          title={
            hasFilters
              ? 'No encontramos instrumentos'
              : 'El inventario está vacío'
          }
          description={
            hasFilters
              ? 'Prueba con otra marca, serial o cambia los filtros.'
              : 'Registra el primer instrumento para comenzar a crear asignaciones.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            ) : (
              <Button onClick={() => setNewInstrumentOpen(true)}>
                <Plus className="size-4" />
                Registrar instrumento
              </Button>
            )
          }
        />
      ) : view === 'cards' ? (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {filteredInstruments.map((instrument) => (
            <InstrumentCard
              key={instrument.id}
              instrument={instrument}
              assignedStudentName={
                instrument.assignedStudentId
                  ? studentNames.get(instrument.assignedStudentId)
                  : undefined
              }
              onAssign={setAssignInstrument}
              onUnassign={handleUnassign}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <InstrumentsTable
              instruments={filteredInstruments}
              studentNames={studentNames}
              onAssign={setAssignInstrument}
              onUnassign={handleUnassign}
            />
          </div>
          <div className="md:hidden">
            <InstrumentList
              instruments={filteredInstruments}
              studentNames={studentNames}
              onAssign={setAssignInstrument}
              onUnassign={handleUnassign}
            />
          </div>
        </>
      )}

      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <Link2 className="size-4 text-primary" />
        ¿Necesitas vincular un instrumento? Usa “Asignar a estudiante” en
        cualquier tarjeta disponible.
      </div>

      <NewInstrumentDialog
        open={newInstrumentOpen}
        onOpenChange={setNewInstrumentOpen}
      />

      <AssignInstrumentDialog
        open={assignInstrument !== null}
        onOpenChange={(open) => {
          if (!open) {
            setAssignInstrument(null)
          }
        }}
        instrument={assignInstrument}
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
