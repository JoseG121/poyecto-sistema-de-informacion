import { zodResolver } from '@hookform/resolvers/zod'
import {
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  ShieldCheck,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
import { useAuth } from '@/context/AuthContext'
import { VALIDATION_KEY } from '@/utils/constants'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { registerSchema, type RegisterFormValues } from '@/utils/validators'

const registerFields = [
  'cedula',
  'nombre',
  'apellido',
  'contrasena',
  'confirmarContrasena',
  'claveValidacion',
] as const

export function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      cedula: '',
      nombre: '',
      apellido: '',
      contrasena: '',
      confirmarContrasena: '',
      claveValidacion: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        cedula: values.cedula,
        nombre: values.nombre,
        apellido: values.apellido,
        contrasena: values.contrasena,
        claveValidacion: values.claveValidacion,
      })
      toast.success('Usuario registrado', {
        description: 'Ya puedes iniciar sesión con tu cédula y contraseña.',
      })
      navigate(`/login?cedula=${encodeURIComponent(values.cedula)}`, {
        replace: true,
      })
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      let hasFieldError = false

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (
          registerFields.includes(field as (typeof registerFields)[number])
        ) {
          form.setError(field as (typeof registerFields)[number], {
            message,
          })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        toast.error('No se pudo completar el registro', {
          description: getErrorMessage(error),
        })
      }
    }
  }

  return (
    <Card className="border-border/70 shadow-xl shadow-primary/5">
      <CardHeader className="space-y-1.5 p-4 sm:p-6">
        <div className="mb-2 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary sm:size-11">
          <UserPlus className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl sm:text-2xl">Crear cuenta</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Regístrate con la clave de validación del núcleo para comenzar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:space-y-5 sm:p-6 sm:pt-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cedula"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cédula</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="username"
                        placeholder="V-12345678"
                        className="pl-9 uppercase"
                        maxLength={30}
                      />
                    </FormControl>
                    <Fingerprint className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" placeholder="Ana" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="family-name"
                        placeholder="Pérez"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contrasena"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          placeholder="Mínimo 8 caracteres"
                          className="pr-9"
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={
                          showPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarContrasena"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar contraseña</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Repite la contraseña"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="claveValidacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clave de validación</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="Clave del núcleo"
                        className="pl-9"
                        maxLength={12}
                      />
                    </FormControl>
                    <ShieldCheck className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <FormDescription>
                    Clave estricta suministrada por la coordinación. En esta
                    instalación es{' '}
                    <span className="font-mono">{VALIDATION_KEY}</span>.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
