import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormControl } from '@/components/ui/form'
import { DOCUMENT_TYPES, type DocumentType } from '@/types/domain'
import { DOCUMENT_TYPE_LABELS } from '@/utils/constants'
import { formatCedula, sanitizeDocumentNumber, splitCedula } from '@/utils/cedula'

interface CedulaInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CedulaInput({
  value,
  onChange,
  placeholder = '12345678',
  disabled = false,
}: CedulaInputProps) {
  const { type, number } = splitCedula(value)

  const handleTypeChange = (nextType: DocumentType) => {
    onChange(formatCedula(nextType, number))
  }

  const handleNumberChange = (raw: string) => {
    const nextNumber = sanitizeDocumentNumber(type, raw)
    onChange(formatCedula(type, nextNumber))
  }

  return (
    <div className="flex w-full gap-2">
      <Select
        value={type}
        onValueChange={(nextType) => handleTypeChange(nextType as DocumentType)}
        disabled={disabled}
      >
        <SelectTrigger
          aria-label="Tipo de documento"
          className="w-[5.5rem] shrink-0 font-medium"
        >
          <SelectValue>{type}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DOCUMENT_TYPES.map((documentType) => (
            <SelectItem key={documentType} value={documentType}>
              {DOCUMENT_TYPE_LABELS[documentType]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FormControl>
        <Input
          value={number}
          onChange={(event) => handleNumberChange(event.target.value)}
          inputMode={type === 'P' ? 'text' : 'numeric'}
          autoComplete="off"
          placeholder={placeholder}
          maxLength={type === 'P' ? 15 : 10}
          disabled={disabled}
          className="min-w-0 flex-1 uppercase"
        />
      </FormControl>
    </div>
  )
}
