import { zodResolver } from '@hookform/resolvers/zod'
import {
  BadgeCheck,
  CheckCircle2,
  Loader2,
  Save,
  XCircle,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { instrumentsService } from '@/api/instruments'
import {
  INSTRUMENT_CATALOG,
  INSTRUMENT_CATEGORIES,
  INSTRUMENT_CATEGORY_DESCRIPTIONS,
  INSTRUMENT_CATEGORY_LABELS,
} from '@/utils/constants'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { normalizeSerial } from '@/utils/utils'
import {
  instrumentSchema,
  type InstrumentFormValues,
} from '@/utils/validators'
import type { Instrument } from '@/types/domain'

const instrumentFields = ['category', 'name', 'brand', 'serial'] as const

type SerialStatus = 'idle' | 'checking' | 'available' | 'taken'

interface InstrumentFormProps {
  onCreated?: (instrument: Instrument) => void
  onCancel?: () => void
}

export function InstrumentForm({ onCreated, onCancel }: InstrumentFormProps) {
  const { createInstrument } = useData()
  const [serialStatus, setSerialStatus] = useState<SerialStatus>('idle')
  const serialRequestId = useRef(0)

  const form = useForm<InstrumentFormValues>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      category: undefined,
      name: '',
      brand: '',
      serial: '',
    },
  })

  const category = form.watch('category')
  const isSubmitting = form.formState.isSubmitting
  const nameOptions = category ? INSTRUMENT_CATALOG[category] : []

  const checkSerial = async (rawSerial: string) => {
    const serial = normalizeSerial(rawSerial)

    if (serial.length < 3) {
      return
    }

    const requestId = ++serialRequestId.current
    setSerialStatus('checking')

    try {
      const available = await instrumentsService.checkSerial(serial)

      if (requestId !== serialRequestId.current) {
        return
      }

      setSerialStatus(available ? 'available' : 'taken')

      if (!available) {
        form.setError('serial', {
          message: 'Este serial ya está registrado',
        })
      }
    } catch {
      if (requestId === serialRequestId.current) {
        setSerialStatus('idle')
      }
    }
  }

  const handleSubmit = async (values: InstrumentFormValues) => {
    try {
      const instrument = await createInstrument({
        ...values,
        serial: normalizeSerial(values.serial),
      })
      toast.success('Instrumento registrado', {
        description: `${instrument.name} · Serial ${instrument.serial} agregado al inventario.`,
      })
      form.reset({
        category: undefined,
        name: '',
        brand: '',
        serial: '',
      })
      setSerialStatus('idle')
      onCreated?.(instrument)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      let hasFieldError = false

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (instrumentFields.includes(field as (typeof instrumentFields)[number])) {
          form.setError(field as (typeof instrumentFields)[number], {
            message,
          })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        toast.error('No se pudo registrar el instrumento', {
          description: getErrorMessage(error),
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue('name', '')
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INSTRUMENT_CATEGORIES.map((categoryValue) => (
                    <SelectItem key={categoryValue} value={categoryValue}>
                      {INSTRUMENT_CATEGORY_LABELS[categoryValue]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {category
                  ? INSTRUMENT_CATEGORY_DESCRIPTIONS[category]
                  : 'La categoría determina los instrumentos disponibles.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrumento</FormLabel>
              {category === 'percusion' ? (
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Tambor redoblante, congas, maracas…"
                    maxLength={60}
                  />
                </FormControl>
              ) : (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!category}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          category
                            ? 'Selecciona el instrumento'
                            : 'Primero elige una categoría'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {nameOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <span className="capitalize">{option}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. Yamaha"
                    autoComplete="off"
                    maxLength={60}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serial único</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ej. VN-2401"
                    autoComplete="off"
                    maxLength={30}
                    className="font-mono uppercase"
                    onChange={(event) => {
                      field.onChange(event)
                      if (serialStatus === 'taken') {
                        setSerialStatus('idle')
                        form.clearErrors('serial')
                      }
                    }}
                    onBlur={() => {
                      field.onBlur()
                      void checkSerial(field.value)
                    }}
                  />
                </FormControl>
                {serialStatus === 'checking' && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Verificando disponibilidad…
                  </p>
                )}
                {serialStatus === 'available' && (
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3" />
                    Serial disponible
                  </p>
                )}
                {serialStatus === 'taken' && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <XCircle className="size-3" />
                    Serial no disponible en el inventario
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSubmitting ? 'Guardando…' : 'Registrar instrumento'}
          </Button>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <BadgeCheck className="size-3.5 text-primary" />
          El serial se valida automáticamente contra el inventario.
        </p>
      </form>
    </Form>
  )
}
