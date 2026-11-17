import { Music2 } from 'lucide-react'

import { APP } from '@/utils/constants'
import { cn } from '@/utils/utils'

interface BrandMarkProps {
  showText?: boolean
  tone?: 'default' | 'inverse'
  className?: string
}

export function BrandMark({
  showText = true,
  tone = 'default',
  className,
}: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-xl shadow-lg',
          tone === 'inverse'
            ? 'bg-white/15 text-white shadow-black/20 ring-1 ring-white/20'
            : 'bg-gradient-to-br from-primary to-violet-600 text-primary-foreground shadow-primary/25',
        )}
      >
        <Music2 className="size-5" aria-hidden="true" />
      </div>
      {showText && (
        <div className="min-w-0">
          <p
            className={cn(
              'truncate font-heading text-sm leading-tight font-semibold',
              tone === 'inverse' ? 'text-white' : 'text-foreground',
            )}
          >
            {APP.shortName}
          </p>
          <p
            className={cn(
              'truncate text-[11px] tracking-wide uppercase',
              tone === 'inverse' ? 'text-white/60' : 'text-muted-foreground',
            )}
          >
            {APP.subtitle}
          </p>
        </div>
      )}
    </div>
  )
}
