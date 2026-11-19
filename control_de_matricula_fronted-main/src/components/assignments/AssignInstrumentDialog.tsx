import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Guitar, Info, Link2, Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { CategoryBadge } from '@/components/shared/instrument-badges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/context/DataContext'
import { getErrorMessage, getFieldErrors } from '@/utils/errors'
import { fullName } from '@/utils/utils'
import {
  assignmentSchema,
  type AssignmentFormValues,
} from '@/utils/validators'
import type { Instrument, Student } from '@/types/domain'

interface AssignInstrumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student | null
  instrument?: Instrument | null
}

export function AssignInstrumentDialog({
  open,
  onOpenChange,
  student,
  instrument,
}: AssignInstrumentDialogProps) {
  const { students, instruments, assignInstrument } = useData()
  const presetStudentId = student?.id ?? ''
  const presetSerial = instrument?.serial ?? ''

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      studentId: presetStudentId,
      instrumentSerial: presetSerial,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        studentId: presetStudentId,
        instrumentSerial: presetSerial,
      })
    }
  }, [open, presetStudentId, presetSerial, form])

  const selectedStudentId = form.watch('studentId')
  const selectedSerial = form.watch('instrumentSerial')

  const selectableStudents = students.filter(
    (candidate) => !candidate.instrument || candidate.id === presetStudentId,
  )
  const selectableInstruments = instruments.filter(
    (candidate) => candidate.status === 'disponible' || candidate.id === instrument?.id,
  )

  const selectedStudent = students.find(
    (candidate) => candidate.id === selectedStudentId,
  )
  const selectedInstrument = instruments.find(
    (candidate) => candidate.serial === selectedSerial,
  )
  const hasConflict =
    Boolean(selectedStudent?.instrument) ||
    selectedInstrument?.status === 'asignado'
  const noAvailableInstruments = selectableInstruments.length === 0

  const onSubmit = async (values: AssignmentFormValues) => {
    try {
      await assignInstrument(values)
      toast.success('Instrumento asignado', {
        description: `${selectedInstrument?.name ?? 'Instrumento'} · Serial ${values.instrumentSerial} vinculado correctamente.`,
      })
      onOpenChange(false)
    } catch (error) {
      const fieldErrors = getFieldErrors(error)
      let hasFieldError = false

      for (const [field, message] of Object.entries(fieldErrors)) {
        if (field === 'studentId' || field === 'instrumentSerial') {
          form.setError(field, { message })
          hasFieldError = true
        }
      }

      if (!hasFieldError) {
        toast.error('No se pudo asignar el instrumento', {
          description: getErrorMessage(error),
        })
      }
    }
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-lg overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Link2 className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Asignar instrumento</DialogTitle>
          <DialogDescription>
            Vincula un instrumento disponible a un estudiante mediante su ID y
            el serial del instrumento.
          </DialogDescription>
        </DialogHeader>

        {noAvailableInstruments && (
          <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            No hay instrumentos disponibles. Registra uno nuevo antes de
            asignar.
          </div>
        )}

        {hasConflict && (
          <div className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            El estudiante ya tiene un instrumento o el serial seleccionado no
            está disponible. Libera la asignación actual para continuar.
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estudiante</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={Boolean(student) || noAvailableInstruments}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un estudiante" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableStudents.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          No hay estudiantes sin instrumento
                        </SelectItem>
                      ) : (
                        selectableStudents.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.id}>
                            {fullName(candidate.firstName, candidate.lastName)} ·{' '}
                            {candidate.id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Se envía el ID interno del estudiante junto con el serial.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instrumentSerial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial del instrumento</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={Boolean(instrument) || noAvailableInstruments}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un serial disponible" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectableInstruments.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          Sin instrumentos disponibles
                        </SelectItem>
                      ) : (
                        selectableInstruments.map((candidate) => (
                          <SelectItem
                            key={candidate.id}
                            value={candidate.serial}
                          >
                            {candidate.serial} · {candidate.name} ·{' '}
                            {candidate.brand}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedStudent && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <p className="font-medium text-foreground">
                  {fullName(
                    selectedStudent.firstName,
                    selectedStudent.lastName,
                  )}
                </p>
                <p className="text-muted-foreground">
                  Representante:{' '}
                  {fullName(
                    selectedStudent.representativeFirstName,
                    selectedStudent.representativeLastName,
                  )}{' '}
                  · {selectedStudent.representativeCedula}
                </p>
              </div>
            )}

            {selectedInstrument && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Guitar className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize">
                    {selectedInstrument.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedInstrument.brand} · Serial{' '}
                    <span className="font-mono">
                      {selectedInstrument.serial}
                    </span>
                  </p>
                </div>
                <CategoryBadge category={selectedInstrument.category} />
              </div>
            )}

            {!selectedInstrument && (
              <div className="flex gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" />
                El serial identifica de forma única el instrumento y se valida
                contra el inventario.
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || hasConflict || noAvailableInstruments
                }
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                Asignar instrumento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
