import {
  Download,
  Eye,
  Link2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Unlink,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  onDelete: (student: Student) => void
  compact?: boolean
}

export function StudentActions({
  student,
  onAssign,
  onUnassign,
  onDownloadPdf,
  onDelete,
  compact = false,
}: StudentActionsProps) {
  const { isAdmin } = useAuth()
  const fullStudentName = `${student.firstName} ${student.lastName}`

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Más acciones para ${fullStudentName}`}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link to={`/estudiantes/${student.id}`}>
              <Eye className="size-4" />
              Ver detalle
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onDownloadPdf(student)}>
            <Download className="size-4" />
            Descargar planilla
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/estudiantes/${student.id}/editar`}>
                  <Pencil className="size-4" />
                  Editar
                </Link>
              </DropdownMenuItem>
              {student.instrument ? (
                <DropdownMenuItem onSelect={() => onUnassign(student)}>
                  <Unlink className="size-4" />
                  Liberar instrumento
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onSelect={() => onAssign(student)}>
                  <Link2 className="size-4" />
                  Asignar instrumento
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onDelete(student)}
              >
                <Trash2 className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              to={`/estudiantes/${student.id}`}
              aria-label={`Ver detalle de ${fullStudentName}`}
            >
              <Eye className="size-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ver detalle</TooltipContent>
      </Tooltip>

      {isAdmin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link
                to={`/estudiantes/${student.id}/editar`}
                aria-label={`Editar datos de ${fullStudentName}`}
              >
                <Pencil className="size-4" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Editar estudiante</TooltipContent>
        </Tooltip>
      )}

      {isAdmin &&
        (student.instrument ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onUnassign(student)}
                aria-label={`Liberar instrumento de ${fullStudentName}`}
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
                aria-label={`Asignar instrumento a ${fullStudentName}`}
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
            aria-label={`Descargar planilla de ${fullStudentName}`}
          >
            <Download className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Descargar planilla</TooltipContent>
      </Tooltip>

      {isAdmin && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(student)}
              aria-label={`Eliminar a ${fullStudentName}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Eliminar estudiante</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
