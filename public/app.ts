type DocType = 'passport' | 'id_card' | 'qualification' | 'unknown'
interface ExtractionFields {
  //person basic info
  firstName: string | null
  surname: string | null
  fullNames: string | null

  //ID docs
  idNumber: string | null

  //passport-only
  passportNumber: string | null
  dateOfBirth: string | null
  expiryDate: string | null
  issueDate: string | null

  //qualification-only
  qualificationName: string | null
  qualificationType: string | null // NEW
  institutionName: string | null
}

interface AnalyzeResponse {
  documentType: DocType
  // Backend might return nested `fields` or flatten them at top-level
  fields?: ExtractionFields | null
  rawText: string
}

const FIELD_CONFIG: Record<
  DocType,
  { key: keyof ExtractionFields; label: string }[]
> = {
  id_card: [
    { key: 'firstName', label: 'First name' },
    { key: 'surname', label: 'Surname' },
    { key: 'idNumber', label: 'ID Number' },
  ],
  passport: [
    { key: 'firstName', label: 'First name' },
    { key: 'surname', label: 'Surname' },
    { key: 'passportNumber', label: 'Passport Number' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'expiryDate', label: 'Expiry Date' },
  ],
  qualification: [
    { key: 'firstName', label: 'First name' },
    { key: 'surname', label: 'Surname' },
    { key: 'qualificationType', label: 'Qualification type' },
    { key: 'qualificationName', label: 'Qualification' },
    { key: 'institutionName', label: 'Institution' },
    { key: 'issueDate', label: 'Date (issue/effective)' },
  ],
  // Show every field with placeholders when type is unknown
  unknown: [
    { key: 'firstName', label: 'First name' },
    { key: 'surname', label: 'Surname' },
    { key: 'fullNames', label: 'Full names' },
    { key: 'idNumber', label: 'ID Number' },
    { key: 'passportNumber', label: 'Passport Number' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'issueDate', label: 'Issue Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'qualificationType', label: 'Qualification type' },
    { key: 'qualificationName', label: 'Qualification' },
    { key: 'institutionName', label: 'Institution' },
  ],
}

const form = document.getElementById('upload-form') as HTMLFormElement | null
const statusDiv = document.getElementById(
  'status'
) as HTMLParagraphElement | null
const resultDiv = document.getElementById('result') as HTMLDivElement | null
const fileInput = document.getElementById(
  'document-input'
) as HTMLInputElement | null

// sanity checks
if (!form || !statusDiv || !resultDiv || !fileInput) {
  throw new Error(
    'Required DOM elements not found (form/status/result/file input)'
  )
}
// form event listener
form.addEventListener('submit', async (event: SubmitEvent) => {
  event.preventDefault()

  const file = fileInput.files?.[0]

  if (!file) {
    statusDiv.textContent = 'Please select a file first'
    return
  }

  statusDiv.textContent = 'Analyzing document...'
  resultDiv.classList.add('hidden')

  const formData = new FormData()
  formData.append('document', file)

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = 'Server error'
      try {
        const errData = (await response.json()) as { error?: string }
        if (errData.error) errorMessage = errData.error
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage)
    }

    const data = (await response.json()) as AnalyzeResponse
    statusDiv.textContent = 'Done.'
    renderResult(data)
  } catch (error) {
    console.error(error)
    statusDiv.textContent = 'Error analyzing document'
  }
})

//result rendering method
const renderResult = (data: AnalyzeResponse): void => {
  const { documentType, fields, rawText } = data

  // 1) Safe doc type
  const safeDocType: DocType =
    documentType === 'passport' ||
    documentType === 'id_card' ||
    documentType === 'qualification'
      ? documentType
      : 'unknown'

  //safe fields
  const fallbackFlatFields = extractFlatFieldsFromResponse(data)
  const safeFields: ExtractionFields = {
    firstName: null,
    surname: null,
    fullNames: null,
    idNumber: null,
    passportNumber: null,
    dateOfBirth: null,
    expiryDate: null,
    issueDate: null,
    qualificationName: null,
    qualificationType: null,
    institutionName: null,
    ...(fields ?? {}),
    ...fallbackFlatFields,
  }

  const docType = document.createElement('p')
  docType.className = 'mb-3'
  docType.textContent = 'Document type: ' + (safeDocType || 'Unknown')

  const table = document.createElement('table')
  table.className = 'w-full border-collapse text-sm mb-4'
  const tbody = document.createElement('tbody')

  const fieldConfig = FIELD_CONFIG[safeDocType] ?? []
  const placeholder = 'Not provided'
  let hasAnyRow = false

  fieldConfig.forEach(({ key, label }) => {
    const value = safeFields[key]
    const displayValue =
      value === null || value === '' ? placeholder : String(value)
    hasAnyRow = true

    const tr = document.createElement('tr')
    tr.className = 'border-b border-slate-700/80'

    const keyTd = document.createElement('td')
    keyTd.textContent = label
    keyTd.className = 'py-2 pr-4 font-medium text-slate-200'

    const valueTd = document.createElement('td')
    valueTd.textContent = displayValue
    valueTd.className = 'py-2 text-slate-300'

    tr.appendChild(keyTd)
    tr.appendChild(valueTd)
    tbody.appendChild(tr)
  })

  if (!hasAnyRow) {
    const tr = document.createElement('tr')
    tr.className = 'border-b border-slate-700/80'

    const keyTd = document.createElement('td')
    keyTd.textContent = 'Info'
    keyTd.className = 'py-2 pr-4 font-medium text-slate-200'

    const valueTd = document.createElement('td')
    valueTd.textContent = 'No fields extracted for this document.'
    valueTd.className = 'py-2 text-slate-300'

    tr.appendChild(keyTd)
    tr.appendChild(valueTd)
    tbody.appendChild(tr)
  }

  table.appendChild(tbody)

  // Create download button
  const downloadBtn = document.createElement('button')
  downloadBtn.textContent = 'Download as Excel (CSV)'
  downloadBtn.className =
    'mb-3 inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-500 transition cursor-pointer'
  downloadBtn.addEventListener('click', () => {
    const rows: string[] = []

    // --- 1) Structured fields (what's in the table) ---
    rows.push('Section,Field,Value')

    fieldConfig.forEach(({ key, label }) => {
      const rawValue = safeFields[key]
      const displayValue =
        rawValue === null || rawValue === '' ? placeholder : String(rawValue)

      const safeLabel = label.replace(/"/g, '""')
      const safeValue = displayValue.replace(/"/g, '""')

      rows.push(`fields,"${safeLabel}","${safeValue}"`)
    })

    // --- 2) Blank separator row ---
    rows.push('')

    // --- 3) Raw OCR lines, with line numbers ---
    rows.push('Section,Line,Text')
    const rawLines = (rawText || '').split(/\r?\n/)
    rawLines.forEach((line, idx) => {
      const safeValue = line.replace(/"/g, '""')
      rows.push(`raw,${idx + 1},"${safeValue}"`)
    })

    const csvContent = rows.join('\n')
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `document-${safeDocType}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })

  const rawHeading = document.createElement('h2')
  rawHeading.textContent = 'Raw OCR Text'
  rawHeading.className = 'text-sm font-semibold mb-1'

  const rawPre = document.createElement('pre')
  rawPre.textContent = rawText || ''
  rawPre.className =
    'whitespace-pre-wrap text-xs bg-slate-900/60 border-slate-700 rounded-md p-2 text-slate-300'

  resultDiv.innerHTML = ''
  resultDiv.appendChild(docType)
  resultDiv.appendChild(downloadBtn)
  resultDiv.appendChild(table)
  resultDiv.appendChild(rawHeading)
  resultDiv.appendChild(rawPre)
  resultDiv.classList.remove('hidden')
}

// Helper to read fields in case backend returns them flattened
function extractFlatFieldsFromResponse(
  data: AnalyzeResponse
): Partial<ExtractionFields> {
  const keys: (keyof ExtractionFields)[] = [
    'firstName',
    'surname',
    'fullNames',
    'idNumber',
    'passportNumber',
    'dateOfBirth',
    'expiryDate',
    'issueDate',
    'qualificationName',
    'qualificationType',
    'institutionName',
  ]

  const result: Partial<ExtractionFields> = {}
  const flatData = data as unknown as Record<string, unknown>
  for (const key of keys) {
    const value = flatData[key]
    if (typeof value === 'string' || value === null) {
      result[key] = value
    }
  }

  return result
}
