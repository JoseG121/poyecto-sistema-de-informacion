import { Music2 } from 'lucide-react'

import { BrandMark } from '@/components/shared/brand-mark'

export function FullPageLoader() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background auth-glow">
      <BrandMark showText={false} className="scale-125" />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Music2 className="size-4 animate-bounce text-primary" aria-hidden="true" />
        Preparando tu núcleo musical…
      </div>
    </div>
  )
}
