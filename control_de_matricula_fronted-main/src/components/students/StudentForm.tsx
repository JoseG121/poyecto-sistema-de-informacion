import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, Loader2, Save, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { cn } from '@/utils/utils'
import { studentSchema, type StudentFormValues } from '@/utils/validators'

const studentFields = [
  'studentCedula',
  'firstName',
  'lastName',
  'studentDireccion',
  'fechaNacimiento',
  'representativeCedula',
  'representativeFirstName',
  'representativeLastName',
  'representativeDireccion',
  'representativeTelefono',
  'representativeCorreo',
  'parentesco',
] as const

interface StudentFormProps {
  onSubmit: (values: StudentFormValues) => Promise<void>
  submitLabel?: string
  className?: string
  defaultValues?: StudentFormValues
  errorTitle?: string
  cancelTo?: string
}

export function StudentForm({
  onSubmit,
  submitLabel = 'Registrar estudiante',
  className,
  defaultValues,
  errorTitle = 'No se pudo registrar al estudiante',
  cancelTo = '/estudiantes',
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      studentCedula: '',
      firstName: '',
      lastName: '',
      studentDireccion: '',
      fechaNacimiento: '',
      representativeCedula: '',
      representativeFirstName: '',
      representativeLastName: '',
      representativeDireccion: '',
      representativeTelefono: '',
      representativeCorreo: '',
      parentesco: 'Tutor',
      ...defaultValues,
    },
  })

  const { reset } = form

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  const isSubmitting = form.formState.isSubmitting

  const handleSubmit = async (values: StudentFormValues) => {
    try {
      await onSubmit(values)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      let hasFieldError = false

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (studentFields.includes(field as (typeof studentFields)[number])) {
          form.setError(field as (typeof studentFields)[number], { message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        toast.error(errorTitle, {
          description: getErrorMessage(error),
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className={cn('w-full border-border/70 shadow-sm', className)}>
          <CardHeader className="border-b p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Datos del estudiante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 pt-4 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del alumno</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="given-name"
                      placeholder="Ej. Sofía"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido del alumno</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="family-name"
                      placeholder="Ej. Martínez"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentCedula"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 sm:max-w-md">
                  <FormLabel>Cédula del estudiante (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="V-12345678"
                      maxLength={15}
                    />
                  </FormControl>
                  <FormDescription>
                    Puede quedar vacía. Si se indica, debe ser única.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentDireccion"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Dirección del estudiante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="street-address"
                      placeholder="Ej. Calle Bolívar, casa 5"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 sm:max-w-md">
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" max={new Date().toISOString().slice(0, 10)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <Separator />

          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Datos del representante</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-4 pt-0 sm:grid-cols-2 sm:gap-5 sm:p-6 sm:pt-0">
            <FormField
              control={form.control}
              name="representativeFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del representante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="Ej. Roberto"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="representativeLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido del representante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="Ej. Martínez"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="representativeCedula"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 sm:max-w-md">
                  <FormLabel>Cédula del representante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="V-87654321"
                      maxLength={15}
                    />
                  </FormControl>
                  <FormDescription>
                    Campo obligatorio. Formato: V-12345678 o E-12345678.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="representativeDireccion"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Dirección del representante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="street-address"
                      placeholder="Ej. Calle Bolívar, casa 5"
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="representativeTelefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono del representante</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ej. 0414-1234567"
                      maxLength={30}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="representativeCorreo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo del representante (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="Ej. representante@correo.com"
                      maxLength={160}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parentesco"
              render={({ field }) => (
                <FormItem className="sm:col-span-2 sm:max-w-md">
                  <FormLabel>Parentesco</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      placeholder="Ej. Padre, Madre, Tutor"
                      maxLength={50}
                    />
                  </FormControl>
                  <FormDescription>
                    Relación del representante con el estudiante.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:px-6 sm:pt-6">
            <Button type="button" variant="outline" asChild>
              <Link to={cancelTo}>Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isSubmitting ? 'Guardando…' : submitLabel}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  )
}
