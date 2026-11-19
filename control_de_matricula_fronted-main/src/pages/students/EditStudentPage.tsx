import { ArrowLeft, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StudentForm } from '@/components/students/StudentForm'
import { useData } from '@/context/DataContext'
import { studentToFormValues } from '@/utils/student-form'
import { fullName } from '@/utils/utils'
import type { StudentFormValues } from '@/utils/validators'

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>()
  const { students, isLoading, updateStudent } = useData()
  const navigate = useNavigate()

  const student = students.find((candidate) => candidate.id === id)
  const defaultValues = useMemo<StudentFormValues | undefined>(
    () => (student ? studentToFormValues(student) : undefined),
    [student],
  )

  const handleSubmit = async (values: StudentFormValues) => {
    if (!student) {
      return
    }

    const updated = await updateStudent(student.id, {
      ...values,
      studentCedula: values.studentCedula.trim() || undefined,
      fechaInscripcion: student.enrollmentDate,
    })

    toast.success('Estudiante actualizado', {
      description: `${fullName(updated.firstName, updated.lastName)} tiene los datos actualizados.`,
    })
    navigate(`/estudiantes/${student.id}`, { replace: true })
  }

  if (isLoading && !student) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!student || !defaultValues) {
    return (
      <EmptyState
        icon={Users}
        title="Estudiante no encontrado"
        description="El estudiante que intentas editar no existe o fue removido de la matrícula."
        action={
          <Button asChild>
            <Link to="/estudiantes">
              <ArrowLeft className="size-4" />
              Volver al listado
            </Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="w-full min-w-0 space-y-4 sm:space-y-6">
      <div className="border-b pb-4 sm:pb-5">
        <PageHeader
          title="Editar estudiante"
          description="Actualiza los datos del alumno y su representante. La fecha de inscripción se conserva."
          actions={
            <Button variant="outline" asChild>
              <Link to={`/estudiantes/${student.id}`}>
                <ArrowLeft className="size-4" />
                Volver al detalle
              </Link>
            </Button>
          }
        />
      </div>

      <div className="w-full">
        <StudentForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          submitLabel="Guardar cambios"
          errorTitle="No se pudo actualizar al estudiante"
          cancelTo={`/estudiantes/${student.id}`}
        />
      </div>
    </div>
  )
}
