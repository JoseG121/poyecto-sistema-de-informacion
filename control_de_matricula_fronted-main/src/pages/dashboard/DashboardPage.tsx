import {
  ArrowRight,
  Guitar,
  Link2,
  Music4,
  Plus,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { CategoryBadge } from '@/components/shared/instrument-badges'
import { StatCard } from '@/components/shared/stat-card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import {
  INSTRUMENT_CATEGORIES,
  INSTRUMENT_CATEGORY_LABELS,
  INSTRUMENT_CATEGORY_STYLES,
} from '@/utils/constants'
import {
  formatDate,
  fullName,
  initials,
} from '@/utils/utils'

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { students, instruments, isLoading, error, refresh } = useData()

  const stats = useMemo(() => {
    const assignedInstruments = instruments.filter(
      (instrument) => instrument.status === 'asignado',
    ).length
    const availableInstruments = instruments.length - assignedInstruments

    return {
      totalStudents: students.length,
      totalInstruments: instruments.length,
      availableInstruments,
      assignedInstruments,
      studentsWithoutInstrument: students.filter(
        (student) => student.instrument === null,
      ).length,
    }
  }, [students, instruments])

  const coverage =
    stats.totalInstruments > 0
      ? Math.round((stats.assignedInstruments / stats.totalInstruments) * 100)
      : 0

  const categoryStats = useMemo(
    () =>
      INSTRUMENT_CATEGORIES.map((category) => {
        const categoryInstruments = instruments.filter(
          (instrument) => instrument.category === category,
        )

        return {
          category,
          label: INSTRUMENT_CATEGORY_LABELS[category],
          total: categoryInstruments.length,
          assigned: categoryInstruments.filter(
            (instrument) => instrument.status === 'asignado',
          ).length,
          style: INSTRUMENT_CATEGORY_STYLES[category],
        }
      }),
    [instruments],
  )

  const maxCategoryTotal = Math.max(
    ...categoryStats.map((category) => category.total),
    1,
  )
  const recentStudents = students.slice(0, 5)
  const showLoading = isLoading && students.length === 0

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#6d28d9] p-4 text-white shadow-xl shadow-primary/20 sm:p-8">
        <div className="staff-lines absolute inset-0 opacity-30" />
        <Music4 className="absolute -right-8 -bottom-10 size-56 rotate-12 text-white/5" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="max-w-xl">
            <Badge className="mb-2 border-white/15 bg-white/10 text-amber-200 hover:bg-white/10 sm:mb-3">
              <TrendingUp className="size-3" />
              Periodo 2026 · Matrícula activa
            </Badge>
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-3xl">
              Hola, {user?.nombre}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-white/65 sm:mt-2 sm:text-sm">
              Este es el pulso del núcleo: estudiantes inscritos, instrumentos
              disponibles y asignaciones activas en un solo vistazo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
            {isAdmin && (
              <Button
                asChild
                className="bg-white text-[#3b0764] hover:bg-white/90"
              >
                <Link to="/estudiantes/nuevo">
                  <Plus className="size-4" />
                  Nuevo estudiante
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="border-white/25 bg-white/5 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/instrumentos">
                <Guitar className="size-4" />
                Instrumentos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {error && students.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refresh()} />
      ) : showLoading ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl sm:h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 xl:grid-cols-4">
          <StatCard
            label="Estudiantes inscritos"
            value={stats.totalStudents}
            hint={`${stats.studentsWithoutInstrument} sin instrumento`}
            icon={Users}
            tone="primary"
          />
          <StatCard
            label="Instrumentos disponibles"
            value={stats.availableInstruments}
            hint={`de ${stats.totalInstruments} en inventario`}
            icon={Guitar}
            tone="emerald"
          />
          <StatCard
            label="Instrumentos asignados"
            value={stats.assignedInstruments}
            hint={`${coverage}% del inventario en uso`}
            icon={Link2}
            tone="amber"
          />
          <StatCard
            label="Sin instrumento"
            value={stats.studentsWithoutInstrument}
            hint="Estudiantes por vincular"
            icon={UserRound}
            tone="rose"
          />
        </div>
      )}

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b p-4 sm:p-6">
            <CardTitle className="text-base">Cobertura instrumental</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Proporción del inventario actualmente asignado.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 p-4 pt-4 sm:gap-6 sm:p-6 sm:pt-6">
            <div
              className="relative grid size-32 place-items-center rounded-full sm:size-40"
              style={{
                background: `conic-gradient(var(--primary) ${coverage}%, var(--muted) 0)`,
              }}
              role="img"
              aria-label={`${coverage}% del inventario está asignado`}
            >
              <div className="absolute inset-2.5 grid place-items-center rounded-full bg-card sm:inset-3">
                <div className="text-center">
                  <p className="font-heading text-2xl font-semibold sm:text-3xl">
                    {coverage}%
                  </p>
                  <p className="text-[10px] text-muted-foreground sm:text-[11px]">asignado</p>
                </div>
              </div>
            </div>

            <div className="grid w-full grid-cols-2 gap-2 text-center sm:gap-3">
              <div className="rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-amber-950/30 sm:px-3 sm:py-2">
                <p className="font-heading text-base font-semibold text-amber-700 dark:text-amber-300 sm:text-lg">
                  {stats.assignedInstruments}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">Asignados</p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/30 sm:px-3 sm:py-2">
                <p className="font-heading text-base font-semibold text-emerald-700 dark:text-emerald-300 sm:text-lg">
                  {stats.availableInstruments}
                </p>
                <p className="text-[10px] text-muted-foreground sm:text-[11px]">Disponibles</p>
              </div>
            </div>

            {stats.studentsWithoutInstrument > 0 && (
              <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed p-2.5 sm:p-3">
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {stats.studentsWithoutInstrument}{' '}
                  {stats.studentsWithoutInstrument === 1
                    ? 'estudiante espera'
                    : 'estudiantes esperan'}{' '}
                  por un instrumento.
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/estudiantes">
                    Ver
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="border-b p-4 sm:p-6">
            <CardTitle className="text-base">
              Distribución por categoría
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Inventario del núcleo según familia instrumental.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-4 sm:space-y-5 sm:p-6 sm:pt-6">
            {categoryStats.map((category) => (
              <div key={category.category} className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <span
                      className={`size-2 shrink-0 rounded-full ${category.style.dot}`}
                    />
                    <span className="truncate font-medium">{category.label}</span>
                    <CategoryBadge category={category.category} />
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground sm:text-xs">
                    {category.assigned} asig. · {category.total} total
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted sm:h-2">
                  <div
                    className={`h-full rounded-full ${category.style.bar}`}
                    style={{
                      width: `${Math.round(
                        (category.total / maxCategoryTotal) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {instruments.length === 0 && (
              <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                Aún no hay instrumentos registrados en el inventario.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="border-b p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base">Últimos inscritos</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Estudiantes añadidos recientemente a la matrícula.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 px-2" asChild>
                <Link to="/estudiantes">
                  Ver todos
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2 sm:p-6 sm:pt-4">
            {recentStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sin estudiantes todavía"
                description="Registra al primer alumno para comenzar la matrícula."
                className="py-8"
              />
            ) : (
              <ul className="divide-y">
                {recentStudents.map((student) => (
                  <li key={student.id}>
                    <Link
                      to={`/estudiantes/${student.id}`}
                      className="flex items-center gap-2.5 py-2 transition-colors hover:text-primary sm:gap-3 sm:py-3"
                    >
                      <Avatar className="size-8 sm:size-9">
                        <AvatarFallback className="text-[11px] sm:text-xs">
                          {initials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium sm:text-sm">
                          {fullName(student.firstName, student.lastName)}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
                          {student.studentCedula ?? 'Sin cédula'} ·{' '}
                          {formatDate(student.enrollmentDate)}
                        </p>
                      </div>
                      {student.instrument ? (
                        <div className="hidden text-right sm:block">
                          <p className="text-xs font-medium capitalize">
                            {student.instrument.name}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {student.instrument.serial}
                          </p>
                        </div>
                      ) : (
                        <Badge variant="muted" className="shrink-0 text-[10px] sm:text-xs">
                          Sin instrumento
                        </Badge>
                      )}
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="border-b p-4 sm:p-6">
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Atajos del día a día.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 p-4 pt-3 sm:p-6 sm:pt-4">
            <Button variant="outline" className="justify-start text-xs sm:text-sm" asChild>
              <Link to="/estudiantes/nuevo">
                <Users className="size-4 text-primary" />
                Registrar estudiante
              </Link>
            </Button>
            <Button variant="outline" className="justify-start text-xs sm:text-sm" asChild>
              <Link to="/instrumentos">
                <Guitar className="size-4 text-primary" />
                Registrar instrumento
              </Link>
            </Button>
            <Button variant="outline" className="justify-start text-xs sm:text-sm" asChild>
              <Link to="/asignaciones">
                <Link2 className="size-4 text-primary" />
                Gestionar asignaciones
              </Link>
            </Button>
            <div className="mt-1 rounded-lg bg-muted/50 p-2.5 text-[10px] leading-relaxed text-muted-foreground sm:mt-2 sm:p-3 sm:text-[11px]">
              <p className="mb-1 font-medium text-foreground">Consejo</p>
              Usa el serial para vincular instrumentos de forma inequívoca.
              Cada serial es único dentro del inventario.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
