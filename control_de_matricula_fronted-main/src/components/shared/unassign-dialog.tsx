import { Loader2, Unlink } from 'lucide-react'
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

interface UnassignDialogProps {
  student: Student | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UnassignDialog({
  student,
  open,
  onOpenChange,
}: UnassignDialogProps) {
  const { unassignInstrument } = useData()
  const [isPending, setIsPending] = useState(false)

  const handleUnassign = async () => {
    if (!student) {
      return
    }

    setIsPending(true)

    try {
      await unassignInstrument(student.id)
      toast.success('Instrumento liberado', {
        description: `${fullName(student.firstName, student.lastName)} quedó sin instrumento asignado.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast.error('No se pudo liberar el instrumento', {
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
            <Unlink className="size-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle>¿Liberar el instrumento?</AlertDialogTitle>
          <AlertDialogDescription>
            {student
              ? `${fullName(student.firstName, student.lastName)} quedará sin instrumento y el serial ${student.instrument?.serial ?? ''} volverá a estar disponible.`
              : 'El instrumento volverá a estar disponible.'}
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
                void handleUnassign()
              }}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Unlink className="size-4" />
              )}
              Liberar instrumento
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
