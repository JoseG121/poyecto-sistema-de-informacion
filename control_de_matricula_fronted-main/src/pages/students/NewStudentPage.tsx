import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/DataContext'
import { StudentForm } from '@/components/students/StudentForm'
import { fullName } from '@/utils/utils'
import type { StudentFormValues } from '@/utils/validators'

export default function NewStudentPage() {
  const { createStudent } = useData()
  const navigate = useNavigate()

  const handleSubmit = async (values: StudentFormValues) => {
    const student = await createStudent({
      ...values,
      studentCedula: values.studentCedula.trim() || undefined,
    })

    toast.success('Estudiante registrado', {
      description: `${fullName(student.firstName, student.lastName)} fue añadido a la matrícula.`,
    })
    navigate('/estudiantes', { replace: true })
  }

  return (
    <div className="w-full min-w-0">
      <div className="border-b bg-background px-4 py-4 sm:px-6">
        <PageHeader
          title="Registrar estudiante"
          description="Completa los datos del alumno y su representante. La fecha de inscripción se registra automáticamente."
          actions={
            <Button variant="outline" asChild>
              <Link to="/estudiantes">
                <ArrowLeft className="size-4" />
                Volver al listado
              </Link>
            </Button>
          }
        />
      </div>

      <div className="w-full">
        <StudentForm onSubmit={handleSubmit} className="rounded-none border-0 shadow-none" />
      </div>
    </div>
  )
}
