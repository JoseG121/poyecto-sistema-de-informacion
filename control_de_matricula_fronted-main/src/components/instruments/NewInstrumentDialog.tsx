import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InstrumentForm } from '@/components/instruments/InstrumentForm'

interface NewInstrumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewInstrumentDialog({
  open,
  onOpenChange,
}: NewInstrumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Plus className="size-5" aria-hidden="true" />
          </div>
          <DialogTitle>Registrar instrumento</DialogTitle>
          <DialogDescription>
            Selecciona la categoría, el instrumento, la marca y un serial único
            para el inventario.
          </DialogDescription>
        </DialogHeader>

        <InstrumentForm
          onCreated={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
