import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/DataContext'
import { getErrorMessage } from '@/utils/errors'
import { fullName } from '@/utils/utils'
import type { Student } from '@/types/domain'

interface DeleteStudentDialogProps {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDeleted?: () => void
}

export function DeleteStudentDialog({
  student,
  open,
  onOpenChange,
  onDeleted,
}: DeleteStudentDialogProps) {
  const { deleteStudent } = useData()
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    if (!student) {
      return
    }

    setIsPending(true)

    try {
      await deleteStudent(student.id)
      toast.success('Estudiante eliminado', {
        description: `${fullName(student.firstName, student.lastName)} fue removido de la matrícula.${
          student.instrument ? ' Su instrumento quedó disponible.' : ''
        }`,
      })
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      toast.error('No se pudo eliminar al estudiante', {
        description: getErrorMessage(error),
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Trash2 className="size-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle>¿Eliminar al estudiante?</AlertDialogTitle>
          <AlertDialogDescription>
            {student
              ? `${fullName(student.firstName, student.lastName)} será eliminado de la matrícula de forma permanente.${
                  student.instrument
                    ? ` El instrumento ${student.instrument.serial} volverá a estar disponible.`
                    : ''
                }`
              : 'El estudiante será eliminado de forma permanente.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={isPending || !student}
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Eliminar estudiante
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
