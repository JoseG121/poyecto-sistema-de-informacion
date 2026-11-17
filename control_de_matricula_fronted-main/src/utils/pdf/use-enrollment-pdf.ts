import { useCallback } from 'react'
import { toast } from 'sonner'

import type { Student } from '@/types/domain'

export function useEnrollmentPdf(): (student: Student) => void {
  return useCallback((student: Student) => {
    const promise = import(
      '@/utils/pdf/generate-enrollment-pdf'
    ).then(({ generateEnrollmentPdf }) => {
      generateEnrollmentPdf(student)
    })

    toast.promise(promise, {
      loading: 'Generando planilla de inscripción…',
      success: 'Planilla descargada',
      error: 'No se pudo generar la planilla',
    })
  }, [])
}
