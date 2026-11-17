import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { APP, INSTRUMENT_CATEGORY_LABELS } from '@/utils/constants'
import { formatLongDate, fullName } from '@/utils/utils'
import type { Student } from '@/types/domain'

const PRIMARY: [number, number, number] = [76, 29, 149]
const AMBER: [number, number, number] = [245, 158, 11]
const SLATE: [number, number, number] = [71, 85, 105]
const LIGHT: [number, number, number] = [248, 247, 252]

function addSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
): number {
  doc.setFillColor(...PRIMARY)
  doc.roundedRect(15, y - 4, 2.5, 6, 1, 1, 'F')
  doc.setTextColor(...PRIMARY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text(title.toUpperCase(), 20, y)
  doc.setTextColor(...SLATE)
  doc.setFont('helvetica', 'normal')
  return y + 7
}

function addField(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
): void {
  doc.setFontSize(8)
  doc.setTextColor(120, 113, 140)
  doc.text(label.toUpperCase(), x, y)
  doc.setFontSize(10)
  doc.setTextColor(30, 27, 45)
  doc.text(doc.splitTextToSize(value || '—', width), x, y + 5)
}

export function generateEnrollmentPdf(student: Student): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageWidth, 38, 'F')
  doc.setFillColor(...AMBER)
  doc.rect(0, 38, pageWidth, 1.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(APP.name, 15, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(225, 215, 245)
  doc.text(`${APP.subtitle} · Planilla de inscripción`, 15, 22)
  doc.setFontSize(8)
  doc.text('Puerto de Altagracia · Estado Zulia', 15, 28)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text(`Código: ${student.id.toUpperCase()}`, pageWidth - 15, 15, {
    align: 'right',
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(225, 215, 245)
  doc.text(
    `Inscripción: ${formatLongDate(student.enrollmentDate)}`,
    pageWidth - 15,
    22,
    { align: 'right' },
  )

  doc.setTextColor(30, 27, 45)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('Planilla de Inscripción', 15, 52)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE)
  doc.text(
    'Datos del estudiante, representante e instrumento asignado.',
    15,
    58,
  )

  let y = addSectionTitle(doc, 'Datos del estudiante', 70)

  addField(
    doc,
    'Nombre y apellido',
    fullName(student.firstName, student.lastName),
    15,
    y,
    80,
  )
  addField(doc, 'Cédula', student.studentCedula ?? 'No registrada', 110, y, 40)
  addField(doc, 'Fecha de inscripción', formatLongDate(student.enrollmentDate), 155, y, 40)

  y += 16
  y = addSectionTitle(doc, 'Datos del representante', y)

  addField(
    doc,
    'Nombre y apellido',
    fullName(
      student.representativeFirstName,
      student.representativeLastName,
    ),
    15,
    y,
    80,
  )
  addField(doc, 'Cédula', student.representativeCedula, 110, y, 40)

  y += 16
  y = addSectionTitle(doc, 'Instrumento asignado', y)

  if (student.instrument) {
    autoTable(doc, {
      startY: y,
      head: [['Instrumento', 'Categoría', 'Marca', 'Serial']],
      body: [
        [
          student.instrument.name,
          INSTRUMENT_CATEGORY_LABELS[student.instrument.category],
          student.instrument.brand,
          student.instrument.serial,
        ],
      ],
      theme: 'grid',
      margin: { left: 15, right: 15 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [30, 27, 45],
        lineColor: [226, 222, 238],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: PRIMARY,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: LIGHT,
      },
    })

    const lastTable = (doc as unknown as {
      lastAutoTable?: { finalY: number }
    }).lastAutoTable
    y = (lastTable?.finalY ?? y) + 12
  } else {
    doc.setDrawColor(226, 222, 238)
    doc.setFillColor(...LIGHT)
    doc.roundedRect(15, y - 4, pageWidth - 30, 18, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE)
    doc.text('Sin instrumento asignado', 20, y + 3)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 113, 140)
    doc.text(
      'El estudiante aún no tiene un instrumento vinculado en el inventario.',
      20,
      y + 9,
    )
    y += 24
  }

  const signatureY = Math.max(y + 18, 235)
  doc.setDrawColor(160, 152, 180)
  doc.line(15, signatureY, 85, signatureY)
  doc.line(125, signatureY, 195, signatureY)
  doc.setFontSize(8)
  doc.setTextColor(...SLATE)
  doc.text('Firma del representante', 15, signatureY + 5)
  doc.text('Coordinación académica', 125, signatureY + 5)

  doc.setDrawColor(226, 222, 238)
  doc.line(15, 280, 195, 280)
  doc.setFontSize(7.5)
  doc.setTextColor(140, 133, 160)
  doc.text(
    `${APP.name} · Documento generado el ${formatLongDate(new Date().toISOString())}`,
    15,
    285,
  )
  doc.text('Sistema de Control de Matrícula', 195, 285, { align: 'right' })

  const lastName = student.lastName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
  const identifier =
    student.studentCedula?.replace(/[^a-zA-Z0-9]/g, '') ?? student.id

  doc.save(`planilla-${lastName}-${identifier}.pdf`)
}
