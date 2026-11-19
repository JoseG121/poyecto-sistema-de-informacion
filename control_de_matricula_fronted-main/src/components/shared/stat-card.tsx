import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utils/utils'

interface StatCardProps {
  label: string
  value: number | string
  hint?: string
  icon: LucideIcon
  tone?: 'primary' | 'amber' | 'sky' | 'rose' | 'emerald'
}

const toneStyles: Record<
  NonNullable<StatCardProps['tone']>,
  { icon: string; ring: string }
> = {
  primary: {
    icon: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    ring: 'hover:border-violet-300/70 dark:hover:border-violet-800',
  },
  amber: {
    icon: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    ring: 'hover:border-amber-300/70 dark:hover:border-amber-800',
  },
  sky: {
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
    ring: 'hover:border-sky-300/70 dark:hover:border-sky-800',
  },
  rose: {
    icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    ring: 'hover:border-rose-300/70 dark:hover:border-rose-800',
  },
  emerald: {
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    ring: 'hover:border-emerald-300/70 dark:hover:border-emerald-800',
  },
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'primary',
}: StatCardProps) {
  const styles = toneStyles[tone]

  return (
    <div
      className={cn(
        'group rounded-xl border bg-card p-3 shadow-sm transition-colors sm:p-5',
        styles.ring,
      )}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0 space-y-0.5 sm:space-y-1">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
            {value}
          </p>
        </div>
        <div className={cn('shrink-0 rounded-lg p-2 sm:p-2.5', styles.icon)}>
          <Icon className="size-4 sm:size-5" aria-hidden="true" />
        </div>
      </div>
      {hint && (
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground sm:mt-3 sm:text-xs">
          {hint}
        </p>
      )}
    </div>
  )
}
