import { Link2, Unlink } from 'lucide-react'

import {
  CategoryBadge,
  InstrumentStatusBadge,
} from '@/components/shared/instrument-badges'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/context/AuthContext'
import type { Instrument } from '@/types/domain'

interface InstrumentsTableProps {
  instruments: Instrument[]
  studentNames: Map<string, string>
  onAssign: (instrument: Instrument) => void
  onUnassign: (instrument: Instrument) => void
}

export function InstrumentsTable({
  instruments,
  studentNames,
  onAssign,
  onUnassign,
}: InstrumentsTableProps) {
  const { isAdmin } = useAuth()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Instrumento</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Serial</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instruments.map((instrument) => {
            const assignedStudentName = instrument.assignedStudentId
              ? studentNames.get(instrument.assignedStudentId)
              : undefined

            return (
              <TableRow key={instrument.id}>
                <TableCell className="font-medium capitalize">
                  {instrument.name}
                </TableCell>
                <TableCell>
                  <CategoryBadge category={instrument.category} />
                </TableCell>
                <TableCell>{instrument.brand}</TableCell>
                <TableCell className="font-mono text-xs sm:text-sm">
                  {instrument.serial}
                </TableCell>
                <TableCell>
                  <InstrumentStatusBadge status={instrument.status} />
                </TableCell>
                <TableCell className="max-w-[220px] truncate">
                  {assignedStudentName ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin ? (
                    instrument.status === 'disponible' ? (
                      <Button size="sm" onClick={() => onAssign(instrument)}>
                        <Link2 className="size-4" />
                        <span className="hidden sm:inline">Asignar</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onUnassign(instrument)}
                      >
                        <Unlink className="size-4" />
                        <span className="hidden sm:inline">Liberar</span>
                      </Button>
                    )
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
