import { Guitar, Link2, Unlink, UserRound } from 'lucide-react'

import {
  CategoryBadge,
  InstrumentStatusBadge,
} from '@/components/shared/instrument-badges'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/utils'
import type { Instrument } from '@/types/domain'

interface InstrumentCardProps {
  instrument: Instrument
  assignedStudentName?: string
  onAssign: (instrument: Instrument) => void
  onUnassign: (instrument: Instrument) => void
}

export function InstrumentCard({
  instrument,
  assignedStudentName,
  onAssign,
  onUnassign,
}: InstrumentCardProps) {
  const { isAdmin } = useAuth()

  return (
    <article className="card-hover group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      <div
        className={cn(
          'h-1 w-full',
          instrument.category === 'cuerda' && 'bg-violet-500',
          instrument.category === 'madera' && 'bg-amber-500',
          instrument.category === 'metal' && 'bg-sky-500',
          instrument.category === 'percusion' && 'bg-rose-500',
        )}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={instrument.category} />
          <InstrumentStatusBadge status={instrument.status} />
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <Guitar className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-base font-semibold capitalize">
              {instrument.name}
            </h3>
            <p className="truncate text-sm text-muted-foreground">
              {instrument.brand}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-muted/30 px-3 py-2">
          <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
            Serial
          </p>
          <p className="font-mono text-sm font-medium">{instrument.serial}</p>
        </div>

        <div className="mt-4 flex-1">
          {assignedStudentName ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate">{assignedStudentName}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Listo para asignar a un estudiante.
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="mt-4 border-t pt-4">
            {instrument.status === 'disponible' ? (
              <Button
                className="w-full"
                size="sm"
                onClick={() => onAssign(instrument)}
              >
                <Link2 className="size-4" />
                Asignar a estudiante
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => onUnassign(instrument)}
              >
                <Unlink className="size-4" />
                Liberar instrumento
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
