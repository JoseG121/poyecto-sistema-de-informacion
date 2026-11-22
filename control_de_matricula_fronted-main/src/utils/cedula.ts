import { DOCUMENT_TYPES, type DocumentType } from '@/types/domain'

const DEFAULT_DOCUMENT_TYPE: DocumentType = 'V'

export interface CedulaParts {
  type: DocumentType
  number: string
}

export function splitCedula(value: string): CedulaParts {
  const normalized = (value ?? '').trim().toUpperCase()
  const match = normalized.match(/^([VEJGP])\s*-?\s*(.*)$/)
  const candidate = match?.[1] as DocumentType | undefined
  const type =
    candidate && DOCUMENT_TYPES.includes(candidate) ? candidate : DEFAULT_DOCUMENT_TYPE
  const rawNumber = match?.[2] ?? normalized

  return {
    type,
    number: rawNumber.replace(/[^A-Z0-9]/g, ''),
  }
}

export function sanitizeDocumentNumber(type: DocumentType, value: string): string {
  const upper = (value ?? '').toUpperCase()

  return type === 'P'
    ? upper.replace(/[^A-Z0-9]/g, '')
    : upper.replace(/[^0-9]/g, '')
}

export function formatCedula(type: DocumentType, number: string): string {
  const cleanNumber = sanitizeDocumentNumber(type, number)

  return cleanNumber ? `${type}-${cleanNumber}` : `${type}-`
}
