import { ArrowLeft, Home, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background auth-glow px-6 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Music2 className="size-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="font-mono text-sm font-medium text-primary">404</p>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Esta partitura no existe
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          La página que buscas no está en el repertorio. Vuelve al panel para
          continuar gestionando la matrícula.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="outline" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="size-4" />
            Ir al panel
          </Link>
        </Button>
        <Button asChild>
          <Link to="/estudiantes">
            <Home className="size-4" />
            Ver estudiantes
          </Link>
        </Button>
      </div>
    </div>
  )
}
