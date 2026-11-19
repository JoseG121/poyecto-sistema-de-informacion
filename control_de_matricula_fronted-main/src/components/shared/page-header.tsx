import type { ReactNode } from 'react'

import { cn } from '@/utils/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4',
        className,
      )}
    >
      <div className="space-y-1 sm:space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="max-w-2xl text-xs text-muted-foreground sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
