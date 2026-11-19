import {
  ArrowLeft,
  CalendarDays,
  Download,
  Fingerprint,
  Guitar,
  Link2,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Trash2,
  Unlink,
  UserRound,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { DeleteStudentDialog } from '@/components/shared/delete-student-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { CategoryBadge } from '@/components/shared/instrument-badges'
import { PageHeader } from '@/components/shared/page-header'
import { UnassignDialog } from '@/components/shared/unassign-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignInstrumentDialog } from '@/components/assignments/AssignInstrumentDialog'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useIsMobile } from '@/hooks/use-is-mobile'
import { useEnrollmentPdf } from '@/utils/pdf/use-enrollment-pdf'
import {
  formatLongDate,
  fullName,
  initials,
} from '@/utils/utils'
import type { Student } from '@/types/domain'

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const { students, isLoading } = useData()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [assignOpen, setAssignOpen] = useState(false)
  const [unassignOpen, setUnassignOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const downloadPdf = useEnrollmentPdf()

  const student: Student | undefined = students.find(
    (candidate) => candidate.id === id,
  )
  const representative = student?.representatives[0]

  if (isLoading && !student) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-5 w-80 max-w-full" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <EmptyState
        icon={Users}
        title="Estudiante no encontrado"
        description="El estudiante solicitado no existe o fue removido de la matrícula."
        action={
          <Button asChild>
            <Link to="/estudiantes">
              <ArrowLeft className="size-4" />
              Volver al listado
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      <PageHeader
        title={fullName(student.firstName, student.lastName)}
        description={`Inscrito el ${formatLongDate(student.enrollmentDate)} · ID ${student.id}`}
        actions={
          isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <MoreHorizontal className="size-4" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/estudiantes">
                    <ArrowLeft className="size-4" />
                    Volver al listado
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => downloadPdf(student)}>
                  <Download className="size-4" />
                  Descargar planilla
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/estudiantes/${student.id}/editar`}>
                        <Pencil className="size-4" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    {student.instrument ? (
                      <DropdownMenuItem onSelect={() => setUnassignOpen(true)}>
                        <Unlink className="size-4" />
                        Liberar instrumento
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onSelect={() => setAssignOpen(true)}>
                        <Link2 className="size-4" />
                        Asignar instrumento
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/estudiantes">
                  <ArrowLeft className="size-4" />
                  Volver
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => downloadPdf(student)}
              >
                <Download className="size-4" />
                Descargar planilla
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" asChild>
                    <Link to={`/estudiantes/${student.id}/editar`}>
                      <Pencil className="size-4" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Eliminar
                  </Button>
                </>
              )}
              {isAdmin &&
                (student.instrument ? (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setUnassignOpen(true)}
                  >
                    <Unlink className="size-4" />
                    Liberar instrumento
                  </Button>
                ) : (
                  <Button onClick={() => setAssignOpen(true)}>
                    <Link2 className="size-4" />
                    Asignar instrumento
                  </Button>
                ))}
            </>
          )
        }
      />

      <div className="flex items-center gap-2.5 rounded-xl border bg-card p-3 shadow-sm sm:gap-3 sm:p-4">
        <Avatar className="size-10 sm:size-12">
          <AvatarFallback className="text-sm sm:text-base">
            {initials(student.firstName, student.lastName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold sm:text-lg">
            {fullName(student.firstName, student.lastName)}
          </p>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">
            {student.studentCedula ?? 'Cédula del estudiante no registrada'}
          </p>
        </div>
        <Badge variant="success" className="shrink-0 text-[10px] sm:text-xs">
          Matrícula activa
        </Badge>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="border-b p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="size-4 text-primary" aria-hidden="true" />
                Datos del estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 pt-4 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-6">
              <DetailRow
                icon={Users}
                label="Nombre completo"
                value={fullName(student.firstName, student.lastName)}
              />
              <DetailRow
                icon={Fingerprint}
                label="Cédula"
                value={student.studentCedula ?? 'No registrada'}
              />
              <DetailRow
                icon={CalendarDays}
                label="Fecha de nacimiento"
                value={
                  student.fechaNacimiento
                    ? formatLongDate(student.fechaNacimiento)
                    : 'No registrada'
                }
              />
              <DetailRow
                icon={MapPin}
                label="Dirección"
                value={student.direccion ?? 'No registrada'}
              />
              <DetailRow
                icon={CalendarDays}
                label="Fecha de inscripción"
                value={formatLongDate(student.enrollmentDate)}
              />
              <DetailRow
                icon={Fingerprint}
                label="ID interno"
                value={student.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-primary" aria-hidden="true" />
                Representante
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-4 pt-4 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-6">
              <DetailRow
                icon={UserRound}
                label="Nombre completo"
                value={fullName(
                  student.representativeFirstName,
                  student.representativeLastName,
                )}
              />
              <DetailRow
                icon={Fingerprint}
                label="Cédula"
                value={student.representativeCedula}
              />
              <DetailRow
                icon={UserRound}
                label="Parentesco"
                value={representative?.parentesco ?? 'No registrado'}
              />
              <DetailRow
                icon={MapPin}
                label="Dirección"
                value={representative?.direccion ?? 'No registrada'}
              />
              <DetailRow
                icon={Phone}
                label="Teléfono"
                value={representative?.telefono ?? 'No registrado'}
              />
              <DetailRow
                icon={Mail}
                label="Correo"
                value={representative?.correo ?? 'No registrado'}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader className="border-b p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <Guitar className="size-4 text-primary" aria-hidden="true" />
              Instrumento asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-4 sm:p-6 sm:pt-6">
            {student.instrument ? (
              <div className="space-y-4">
                <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-amber-500/5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-lg font-semibold capitalize">
                        {student.instrument.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.instrument.brand}
                      </p>
                    </div>
                    <CategoryBadge category={student.instrument.category} />
                  </div>
                  <div className="mt-4 rounded-lg border bg-background/70 p-3">
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      Serial
                    </p>
                    <p className="font-mono text-sm font-medium">
                      {student.instrument.serial}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => setUnassignOpen(true)}
                  >
                    <Unlink className="size-4" />
                    Liberar instrumento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-muted/20 px-4 py-8 text-center">
                  <div className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                    <Guitar className="size-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-medium">Sin instrumento</p>
                  <p className="text-xs text-muted-foreground">
                    Este estudiante aún no tiene un instrumento vinculado.
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    className="w-full"
                    onClick={() => setAssignOpen(true)}
                  >
                    <Link2 className="size-4" />
                    Asignar instrumento
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignInstrumentDialog
        open={assignOpen}
        onOpenChange={setAssignOpen}
        student={student}
      />

      <UnassignDialog
        student={student}
        open={unassignOpen}
        onOpenChange={setUnassignOpen}
      />

      <DeleteStudentDialog
        student={student}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => navigate('/estudiantes', { replace: true })}
      />
    </div>
  )
}
