import { Download, Eye, Link2, Unlink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useAuth } from '@/context/AuthContext'
import type { Student } from '@/types/domain'

interface StudentActionsProps {
  student: Student
  onAssign: (student: Student) => void
  onUnassign: (student: Student) => void
  onDownloadPdf: (student: Student) => void
}

export function StudentActions({
  student,
  onAssign,
  onUnassign,
  onDownloadPdf,
}: StudentActionsProps) {
  const { isAdmin } = useAuth()

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              to={`/estudiantes/${student.id}`}
              aria-label={`Ver detalle de ${student.firstName} ${student.lastName}`}
            >
              <Eye className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver detalle</TooltipContent>
      </Tooltip>

      {isAdmin &&
        (student.instrument ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onUnassign(student)}
                aria-label={`Liberar instrumento de ${student.firstName} ${student.lastName}`}
              >
                <Unlink className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Liberar instrumento</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onAssign(student)}
                aria-label={`Asignar instrumento a ${student.firstName} ${student.lastName}`}
              >
                <Link2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Asignar instrumento</TooltipContent>
          </Tooltip>
        ))}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDownloadPdf(student)}
            aria-label={`Descargar planilla de ${student.firstName} ${student.lastName}`}
          >
            <Download className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Descargar planilla</TooltipContent>
      </Tooltip>
    </div>
  )
}
