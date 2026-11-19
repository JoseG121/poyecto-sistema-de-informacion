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

      <div className="flex flex-1 flex-col p-3 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <CategoryBadge category={instrument.category} />
          <InstrumentStatusBadge status={instrument.status} />
        </div>

        <div className="mt-3 flex items-start gap-2.5 sm:mt-4 sm:gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:size-10">
            <Guitar className="size-4 sm:size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-semibold capitalize sm:text-base">
              {instrument.name}
            </h3>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              {instrument.brand}
            </p>
          </div>
        </div>

        <div className="mt-3 rounded-lg border bg-muted/30 px-2.5 py-1.5 sm:mt-4 sm:px-3 sm:py-2">
          <p className="text-[9px] tracking-wider text-muted-foreground uppercase sm:text-[10px]">
            Serial
          </p>
          <p className="font-mono text-xs font-medium sm:text-sm">
            {instrument.serial}
          </p>
        </div>

        <div className="mt-3 flex-1 sm:mt-4">
          {assignedStudentName ? (
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
              <UserRound className="size-3.5 shrink-0" />
              <span className="truncate">{assignedStudentName}</span>
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              Listo para asignar a un estudiante.
            </p>
          )}
        </div>

        {isAdmin && (
          <div className="mt-3 border-t pt-3 sm:mt-4 sm:pt-4">
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
