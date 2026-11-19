import { Guitar, Link2, Unlink } from 'lucide-react'

import {
  CategoryBadge,
  InstrumentStatusBadge,
} from '@/components/shared/instrument-badges'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import type { Instrument } from '@/types/domain'

interface InstrumentListProps {
  instruments: Instrument[]
  studentNames: Map<string, string>
  onAssign: (instrument: Instrument) => void
  onUnassign: (instrument: Instrument) => void
}

export function InstrumentList({
  instruments,
  studentNames,
  onAssign,
  onUnassign,
}: InstrumentListProps) {
  const { isAdmin } = useAuth()

  return (
    <div className="grid gap-2">
      {instruments.map((instrument) => {
        const assignedStudentName = instrument.assignedStudentId
          ? studentNames.get(instrument.assignedStudentId)
          : undefined

        return (
          <article
            key={instrument.id}
            className="rounded-xl border bg-card p-3 shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Guitar className="size-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize">
                      {instrument.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {instrument.brand}
                    </p>
                  </div>
                  <InstrumentStatusBadge status={instrument.status} />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <CategoryBadge category={instrument.category} />
                  <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                    {instrument.serial}
                  </span>
                </div>

                <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
                  {assignedStudentName ?? 'Sin asignar'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-2.5 border-t pt-2.5">
                {instrument.status === 'disponible' ? (
                  <Button
                    size="sm"
                    className="w-full"
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
          </article>
        )
      })}
    </div>
  )
}
