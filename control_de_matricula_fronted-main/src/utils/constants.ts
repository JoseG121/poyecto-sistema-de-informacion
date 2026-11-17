import type { InstrumentCategory } from '@/types/domain'

export { INSTRUMENT_CATEGORIES } from '@/types/domain'

export const APP = {
  name: 'Núcleo Puerto de Altagracia',
  shortName: 'Núcleo Puerto',
  subtitle: 'Control de Matrícula',
  description:
    'Sistema de gestión de estudiantes, instrumentos y asignaciones del núcleo musical.',
} as const

export const VALIDATION_KEY = '1234'

export const STORAGE_KEYS = {
  token: 'nucleo.auth.token',
  theme: 'nucleo.theme',
} as const

export const INSTRUMENT_CATALOG: Record<
  InstrumentCategory,
  readonly string[]
> = {
  cuerda: ['violín', 'viola', 'chelo', 'contrabajo', 'cuatro', 'guitarra'],
  madera: ['flauta', 'oboe', 'clarinete', 'fagot'],
  metal: ['trompeta', 'corno', 'trombón', 'tuba'],
  percusion: [],
}

export const INSTRUMENT_CATEGORY_LABELS: Record<InstrumentCategory, string> = {
  cuerda: 'Cuerda',
  madera: 'Madera',
  metal: 'Metales',
  percusion: 'Percusión',
}

export const INSTRUMENT_CATEGORY_DESCRIPTIONS: Record<
  InstrumentCategory,
  string
> = {
  cuerda: 'Violín, viola, chelo, contrabajo, cuatro y guitarra',
  madera: 'Flauta, oboe, clarinete y fagot',
  metal: 'Trompeta, corno, trombón y tuba',
  percusion: 'Escribe libremente el instrumento de percusión',
}

export const INSTRUMENT_CATEGORY_STYLES: Record<
  InstrumentCategory,
  { badge: string; dot: string; bar: string }
> = {
  cuerda: {
    badge:
      'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
    dot: 'bg-violet-500',
    bar: 'bg-violet-500',
  },
  madera: {
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
  },
  metal: {
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
  },
  percusion: {
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
    dot: 'bg-rose-500',
    bar: 'bg-rose-500',
  },
}

export const DEMO_CREDENTIALS = {
  cedula: 'V-00000001',
  contrasena: 'Admin123!',
} as const

export const OPERATOR_CREDENTIALS = {
  cedula: 'V-00000002',
  contrasena: 'Operador123!',
} as const
