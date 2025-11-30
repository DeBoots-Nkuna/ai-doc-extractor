type DocType = 'passport' | 'id_card' | 'unknown'
interface ExtractionFields {
  firstName: string | null
  surname: string | null
  idNumber: string | null
}
interface AnalyzeResponse {
  documentType: DocType
  fields: ExtractionFields
  rawText: string
}
const form = document.getElementById('upload-form') as HTMLFormElement | null
const statusDiv = document.getElementById(
  'status'
) as HTMLParagraphElement | null
const resultDiv = document.getElementById('result') as HTMLDivElement | null

// if statement for sanity checks
if (!form || !statusDiv || !resultDiv) {
  throw new Error('Required DOM elements not found')
}

form.addEventListener('submit', async (event: SubmitEvent) => {
  //prevent refresh
  event.preventDefault()

  //collecting uploaded file data
  const fileInput = document.getElementById(
    'document-input'
  ) as HTMLInputElement | null

  //if statement to check if file input exists
  if (!fileInput) {
    statusDiv.textContent = 'File input not found'
    return
  }

  const file = fileInput.files?.[0]

  if (!file) {
    statusDiv.textContent = 'Please select a file first'
    return
  }

  statusDiv.textContent = 'Analyzing document...'
  resultDiv.classList.add('hidden')

  //collecting form data
  const formData = new FormData()
  formData.append('document', file)

  //try/catch

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    })

    //if statement to check status
    if (!response.ok) {
      let errorMessage = 'Server error'

      //try/catch
      try {
        const errData = (await response.json()) as { error?: string }

        //if statement
        if (errData.error) errorMessage = errData.error
      } catch (error) {
        //ignoring json parse errors and keeping it generic error message
      }

      throw new Error(errorMessage)
    }

    //collecting returned response data
    const data = (await response.json()) as AnalyzeResponse
    statusDiv.textContent = 'Done.'

    //function call
    renderResult(data)
  } catch (error) {}
})

//result rendering method
const renderResult = (data: AnalyzeResponse): void => {
  //collecting individual data
  const { documentType, fields, rawText } = data

  const docType = document.createElement('p')
  docType.className = 'mb-3'
  docType.textContent = 'Document type: ' + (documentType || 'Unknown')

  const table = document.createElement('table')
  table.className = 'w-full border-collapse text-sm mb-4'
  const tbody = document.createElement('tbody')

  Object.entries(fields).forEach(([key, value]) => {
    const tr = document.createElement('tr')
    tr.className = 'border-b border-slate-700/80'

    const keyTd = document.createElement('td')
    keyTd.textContent = key
    keyTd.className = 'py-2 pr-4 font-medium text-slat-200'

    const valueTd = document.createElement('td')
    valueTd.textContent = value == null ? '' : String(value)
    valueTd.className = 'py-2 text-slate-300'

    tr.appendChild(keyTd)
    tr.appendChild(valueTd)
    tbody.appendChild(tr)
  })

  table.appendChild(tbody)

  const rawHeading = document.createElement('h2')
  rawHeading.textContent = 'Raw ORC Text'
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
