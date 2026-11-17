import { Eye, Guitar, Link2, Unlink, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { CategoryBadge } from '@/components/shared/instrument-badges'
import { PageHeader } from '@/components/shared/page-header'
import { UnassignDialog } from '@/components/shared/unassign-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AssignInstrumentDialog } from '@/components/assignments/AssignInstrumentDialog'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import {
  formatDate,
  fullName,
  initials,
} from '@/utils/utils'
import type { Student } from '@/types/domain'

export default function AssignmentsPage() {
  const { isAdmin } = useAuth()
  const { students, instruments, isLoading, error, refresh } = useData()
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignStudent, setUnassignStudent] = useState<Student | null>(null)

  const assignedStudents = students.filter(
    (student) => student.instrument !== null,
  )
  const availableCount = instruments.filter(
    (instrument) => instrument.status === 'disponible',
  ).length
  const coverage =
    instruments.length > 0
      ? Math.round((assignedStudents.length / instruments.length) * 100)
      : 0

  const showLoading = isLoading && students.length === 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asignaciones"
        description="Vinculaciones activas entre estudiantes e instrumentos del inventario."
        actions={
          isAdmin ? (
            <Button onClick={() => setAssignOpen(true)}>
              <Link2 className="size-4" />
              Asignar instrumento
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Asignados</p>
          <p className="font-heading text-xl font-semibold">
            {assignedStudents.length}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Disponibles</p>
          <p className="font-heading text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">Cobertura</p>
          <p className="font-heading text-xl font-semibold text-primary">
            {coverage}%
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border bg-gradient-to-r from-primary/5 via-card to-amber-500/5 p-4 text-sm">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Guitar className="size-4" aria-hidden="true" />
        </div>
        <p className="text-muted-foreground">
          Cada estudiante puede tener un solo instrumento activo. Para cambiar
          una asignación, libera el instrumento actual y vuelve a vincular.
        </p>
      </div>

      {error && students.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : showLoading ? (
        <div className="space-y-2 rounded-xl border bg-card p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 py-2">
              <div className="size-9 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-28 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : assignedStudents.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="Aún no hay asignaciones"
          description="Vincula un instrumento disponible a un estudiante para que aparezca en esta lista."
          action={
            isAdmin ? (
              <Button onClick={() => setAssignOpen(true)}>
                <Link2 className="size-4" />
                Crear primera asignación
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card shadow-sm md:block">
            <Table aria-label="Asignaciones de instrumentos">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-4">Estudiante</TableHead>
                  <TableHead>Instrumento</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Serial</TableHead>
                  <TableHead className="pr-4 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="pl-4 whitespace-normal">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback>
                            {initials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {fullName(student.firstName, student.lastName)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.studentCedula ?? student.id} · Inscrito el{' '}
                            {formatDate(student.enrollmentDate)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium capitalize">
                        {student.instrument?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.instrument?.brand}
                      </p>
                    </TableCell>
                    <TableCell>
                      {student.instrument && (
                        <CategoryBadge category={student.instrument.category} />
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs">
                        {student.instrument?.serial}
                      </span>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          aria-label={`Ver estudiante ${student.firstName} ${student.lastName}`}
                        >
                          <Link to={`/estudiantes/${student.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setUnassignStudent(student)}
                            aria-label={`Liberar instrumento de ${student.firstName} ${student.lastName}`}
                          >
                            <Unlink className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {assignedStudents.map((student) => (
              <article
                key={student.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>
                        {initials(student.firstName, student.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        to={`/estudiantes/${student.id}`}
                        className="text-sm font-medium underline-offset-4 hover:text-primary hover:underline"
                      >
                        {fullName(student.firstName, student.lastName)}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {student.studentCedula ?? student.id}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setUnassignStudent(student)}
                      aria-label={`Liberar instrumento de ${student.firstName} ${student.lastName}`}
                    >
                      <Unlink className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {student.instrument?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.instrument?.brand}
                    </p>
                  </div>
                  <div className="text-right">
                    {student.instrument && (
                      <CategoryBadge category={student.instrument.category} />
                    )}
                    <p className="mt-1 font-mono text-xs">
                      {student.instrument?.serial}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4 text-primary" />
            {assignedStudents.length}{' '}
            {assignedStudents.length === 1
              ? 'estudiante con instrumento'
              : 'estudiantes con instrumento'}{' '}
            <Badge variant="muted" className="ml-1">
              {coverage}% de cobertura
            </Badge>
          </div>
        </>
      )}

      <AssignInstrumentDialog open={assignOpen} onOpenChange={setAssignOpen} />

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
