import { Guitar } from 'lucide-react'
import { Link } from 'react-router-dom'

import { CategoryBadge } from '@/components/shared/instrument-badges'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StudentActions } from '@/components/students/StudentActions'
import { formatDate, fullName, initials } from '@/utils/utils'
import type { Student } from '@/types/domain'

interface StudentsTableProps {
  students: Student[]
  onAssign: (student: Student) => void
  onUnassign: (student: Student) => void
  onDownloadPdf: (student: Student) => void
}

export function StudentsTable({
  students,
  onAssign,
  onUnassign,
  onDownloadPdf,
}: StudentsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table aria-label="Estudiantes inscritos">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="pl-4">Estudiante</TableHead>
            <TableHead>Representante</TableHead>
            <TableHead>Inscripción</TableHead>
            <TableHead>Instrumento</TableHead>
            <TableHead className="pr-4 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="pl-4 whitespace-normal">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>
                      {initials(student.firstName, student.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <Link
                      to={`/estudiantes/${student.id}`}
                      className="font-medium underline-offset-4 hover:text-primary hover:underline"
                    >
                      {fullName(student.firstName, student.lastName)}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {student.studentCedula ?? 'Cédula no registrada'}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell className="whitespace-normal">
                <p className="font-medium">
                  {fullName(
                    student.representativeFirstName,
                    student.representativeLastName,
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {student.representativeCedula}
                </p>
              </TableCell>

              <TableCell className="text-muted-foreground">
                {formatDate(student.enrollmentDate)}
              </TableCell>

              <TableCell className="whitespace-normal">
                {student.instrument ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">
                        {student.instrument.name}
                      </span>
                      <CategoryBadge category={student.instrument.category} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {student.instrument.brand} ·{' '}
                      <span className="font-mono">
                        {student.instrument.serial}
                      </span>
                    </p>
                  </div>
                ) : (
                  <Badge variant="muted" className="gap-1.5">
                    <Guitar className="size-3" />
                    Sin instrumento
                  </Badge>
                )}
              </TableCell>

              <TableCell className="pr-4">
                <StudentActions
                  student={student}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                  onDownloadPdf={onDownloadPdf}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function StudentsCards({
  students,
  onAssign,
  onUnassign,
  onDownloadPdf,
}: StudentsTableProps) {
  return (
    <div className="grid gap-3">
      {students.map((student) => (
        <article
          key={student.id}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <Avatar className="size-10">
              <AvatarFallback>
                {initials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                to={`/estudiantes/${student.id}`}
                className="font-medium underline-offset-4 hover:text-primary hover:underline"
              >
                {fullName(student.firstName, student.lastName)}
              </Link>
              <p className="text-xs text-muted-foreground">
                {student.studentCedula ?? 'Cédula no registrada'} · Inscrito el{' '}
                {formatDate(student.enrollmentDate)}
              </p>
            </div>
            <StudentActions
              student={student}
              onAssign={onAssign}
              onUnassign={onUnassign}
              onDownloadPdf={onDownloadPdf}
            />
          </div>

          <div className="mt-3 grid gap-2 border-t pt-3 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Representante</span>
              <span className="text-right font-medium">
                {fullName(
                  student.representativeFirstName,
                  student.representativeLastName,
                )}{' '}
                · {student.representativeCedula}
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground">Instrumento</span>
              {student.instrument ? (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium capitalize">
                      {student.instrument.name}
                    </span>
                    <CategoryBadge category={student.instrument.category} />
                  </div>
                  <p className="text-muted-foreground">
                    {student.instrument.brand} ·{' '}
                    <span className="font-mono">
                      {student.instrument.serial}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="muted" className="gap-1">
                    <Guitar className="size-3" />
                    Sin instrumento
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function StudentsTableSkeleton() {
  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 py-2">
          <div className="size-9 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-40 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="hidden h-3 w-28 animate-pulse rounded bg-muted sm:block" />
          <div className="hidden h-3 w-36 animate-pulse rounded bg-muted md:block" />
        </div>
      ))}
    </div>
  )
}
