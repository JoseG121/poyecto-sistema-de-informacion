import { INSTRUMENT_CATEGORY_LABELS } from '@/utils/constants'
import { cn } from '@/utils/utils'
import type { InstrumentCategory, InstrumentStatus } from '@/types/domain'

const categoryStyles: Record<InstrumentCategory, string> = {
  cuerda:
    'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
  madera:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  metal:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  percusion:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
}

export function CategoryBadge({
  category,
  className,
}: {
  category: InstrumentCategory
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        categoryStyles[category],
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          category === 'cuerda' && 'bg-violet-500',
          category === 'madera' && 'bg-amber-500',
          category === 'metal' && 'bg-sky-500',
          category === 'percusion' && 'bg-rose-500',
        )}
      />
      {INSTRUMENT_CATEGORY_LABELS[category]}
    </span>
  )
}

export function InstrumentStatusBadge({
  status,
  className,
}: {
  status: InstrumentStatus
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium',
        status === 'disponible'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
          : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
        className,
      )}
    >
      <span
        className={cn(
          'size-1.5 rounded-full',
          status === 'disponible' ? 'bg-emerald-500' : 'bg-amber-500',
        )}
      />
      {status === 'disponible' ? 'Disponible' : 'Asignado'}
    </span>
  )
}
