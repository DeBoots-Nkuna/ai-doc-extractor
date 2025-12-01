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
}

interface AnalyzeResponse {
  documentType: DocType
  fields: ExtractionFields | null | undefined
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
    { key: 'qualificationName', label: 'Qualification' },
  ],
  unknown: [
    // for unknown you can either show nothing,
    // or a generic minimal set:
    { key: 'firstName', label: 'First name' },
    { key: 'surname', label: 'Surname' },
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

  // 2) Safe fields – ensure we *never* work with undefined
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
    ...(fields ?? {}), // merge in any values from backend
  }

  const docType = document.createElement('p')
  docType.className = 'mb-3'
  docType.textContent = 'Document type: ' + (safeDocType || 'Unknown')

  const table = document.createElement('table')
  table.className = 'w-full border-collapse text-sm mb-4'
  const tbody = document.createElement('tbody')

  const fieldConfig = FIELD_CONFIG[safeDocType] ?? []

  fieldConfig.forEach(({ key, label }) => {
    const value = safeFields[key]

    if (value == null || value === '') return

    const tr = document.createElement('tr')
    tr.className = 'border-b border-slate-700/80'

    const keyTd = document.createElement('td')
    keyTd.textContent = label
    keyTd.className = 'py-2 pr-4 font-medium text-slate-200'

    const valueTd = document.createElement('td')
    valueTd.textContent = String(value)
    valueTd.className = 'py-2 text-slate-300'

    tr.appendChild(keyTd)
    tr.appendChild(valueTd)
    tbody.appendChild(tr)
  })

  table.appendChild(tbody)

  const rawHeading = document.createElement('h2')
  rawHeading.textContent = 'Raw OCR Text'
  rawHeading.className = 'text-sm font-semibold mb-1'

  const rawPre = document.createElement('pre')
  rawPre.textContent = rawText || ''
  rawPre.className =
    'whitespace-pre-wrap text-xs bg-slate-900/60 border-slate-700 rounded-md p-2 text-slate-300'

  resultDiv.innerHTML = ''
  resultDiv.appendChild(docType)
  resultDiv.appendChild(table)
  resultDiv.appendChild(rawHeading)
  resultDiv.appendChild(rawPre)
  resultDiv.classList.remove('hidden')
}
