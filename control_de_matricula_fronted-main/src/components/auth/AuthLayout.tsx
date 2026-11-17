import { FileText, Guitar, Music2, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { BrandMark } from '@/components/shared/brand-mark'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { APP } from '@/utils/constants'

const features = [
  {
    icon: Users,
    title: 'Matrícula centralizada',
    description: 'Datos del alumno y su representante en un solo lugar.',
  },
  {
    icon: Guitar,
    title: 'Control de instrumentos',
    description: 'Categorías, marcas y seriales únicos siempre bajo control.',
  },
  {
    icon: FileText,
    title: 'Planillas al instante',
    description: 'Descarga la planilla de inscripción en PDF cuando la necesites.',
  },
]

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <aside 
  className="relative hidden overflow-hidden bg-cover bg-center text-white lg:flex lg:flex-col lg:justify-between"
  style={{ backgroundImage: "url('/imagen/imagen.jfif')" }}
> 
<div className="absolute inset-0 bg-black/30" />

  <div className="relative z-10 flex items-center justify-between px-10 pt-10">
    <img 
      src="/imagen/logo1.png" 
      alt="Logo de la Academia" 
      className="h-60 w-90 object-contain" 
    />
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/75 backdrop-blur">
      <Sparkles className="size-3 text-amber-300" />
      Gestión académica musical
    </span>
  </div>

  <div className="relative z-10 max-w-xl px-10 py-12">
    <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-amber-300 uppercase">
      {APP.name}
    </p>
    <h1 className="font-heading text-4xl leading-[1.08] font-semibold tracking-tight xl:text-5xl">
      Tocar cantar y luchar.
    </h1>
    <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">
      Administra la matrícula, el inventario instrumental y las
      asignaciones del núcleo con una experiencia clara, rápida y
      organizada.
    </p>

    <ul className="mt-10 space-y-5">
      {features.map((feature) => (
        <li key={feature.title} className="flex gap-3">
          <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-amber-300">
            <feature.icon className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">{feature.title}</p>
            <p className="text-xs leading-relaxed text-white/50">
              {feature.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  </div>

  <div className="relative z-10 border-t border-white/10 px-10 py-5 text-[11px] text-white/40">
    Puertos de Altagracia · Estado Zulia · Venezuela
  </div>
</aside>

      <main className="relative flex min-h-svh flex-col bg-background">
        <div className="auth-glow pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-5 pb-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="relative px-5 pb-5 text-center text-[11px] text-muted-foreground">
          {APP.name} · {APP.subtitle}
        </p>
      </main>
    </div>
  )
}
