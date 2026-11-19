import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Fingerprint, KeyRound, Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import {
  DEMO_CREDENTIALS,
  OPERATOR_CREDENTIALS,
} from '@/utils/constants'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { loginSchema, type LoginFormValues } from '@/utils/validators'

const loginFields = ['cedula', 'contrasena'] as const

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cedula: searchParams.get('cedula') ?? '',
      contrasena: '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
      const state = location.state as { from?: string } | null
      const destination = state?.from ?? '/dashboard'
      toast.success('Bienvenido de nuevo', {
        description: 'Tu sesión se inició correctamente.',
      })
      navigate(destination, { replace: true })
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      let hasFieldError = false

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (loginFields.includes(field as (typeof loginFields)[number])) {
          form.setError(field as (typeof loginFields)[number], { message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        toast.error('No se pudo iniciar sesión', {
          description: getErrorMessage(error),
        })
      }
    }
  }

  const fillDemoCredentials = () => {
    form.setValue('cedula', DEMO_CREDENTIALS.cedula, {
      shouldValidate: true,
    })
    form.setValue('contrasena', DEMO_CREDENTIALS.contrasena, {
      shouldValidate: true,
    })
    toast.info('Credenciales de administrador cargadas', {
      description: 'Pulsa “Iniciar sesión” para entrar.',
    })
  }

  return (
    <Card className="border-white/20 bg-background/50 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-1.5">
        <div className="mb-2 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
          <LogIn className="size-5" aria-hidden="true" />
        </div>
        <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
        <CardDescription>
          Ingresa con tu cédula para acceder al control de matrícula.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-10">
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
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="pr-10 pl-9"
                      />
                    </FormControl>
                    <KeyRound className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
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

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </Button>
          </form>
        </Form>

        <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs">
          <p className="font-medium text-foreground">Cuentas del núcleo</p>
          <p className="mt-0.5 text-muted-foreground">
            Administrador:{' '}
            <span className="font-mono">
              {DEMO_CREDENTIALS.cedula} / {DEMO_CREDENTIALS.contrasena}
            </span>
          </p>
          <p className="mt-0.5 text-muted-foreground">
            Operador:{' '}
            <span className="font-mono">
              {OPERATOR_CREDENTIALS.cedula} / {OPERATOR_CREDENTIALS.contrasena}
            </span>
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-0 text-primary hover:bg-transparent"
            onClick={fillDemoCredentials}
          >
            Usar credenciales de administrador
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Regístrate
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
