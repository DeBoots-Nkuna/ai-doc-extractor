type Qualification = {
  title?: string
  level?: string
  awardingBody?: string
  country?: string
  awardedDate?: string
  modules?: string[]
}

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status')
  const personCard = document.getElementById('person-card')
  const qualSection = document.getElementById('qualifications-section')
  const qualBody = document.getElementById('qualifications-body')
  const qualCount = document.getElementById('qual-count')
  const downloadBtn = document.getElementById(
    'download-csv-btn'
  ) as HTMLButtonElement | null

  if (!statusEl || !personCard || !qualSection || !qualBody || !qualCount) {
    return
  }

  const raw = localStorage.getItem('docAnalysis')

  if (!raw) {
    statusEl.textContent =
      'No analysis data found. Please upload and analyze a document on the home page first.'
    return
  }

  let stored: any
  try {
    stored = JSON.parse(raw)
  } catch {
    statusEl.textContent = 'Could not read saved summary data.'
    return
  }

  console.log('SUMMARY PAGE – LOADED FROM LOCALSTORAGE:', stored)

  const data: any = stored.fields
    ? {
        documentType: stored.documentType,
        rawText: stored.rawText,
        ...stored.fields,
      }
    : stored

  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      try {
        const qualifications = Array.isArray(data.qualifications)
          ? data.qualifications
          : []

        const payload = {
          rawText: data.rawText ?? '',
          qualifications,

          // 🔽 candidate overview fields
          fullNames: data.fullNames ?? null,
          firstName: data.firstName ?? null,
          surname: data.surname ?? null,
          dateOfBirth: data.dateOfBirth ?? null,
          enrolmentNumber: data.enrolmentNumber ?? data.enrolmentNo ?? null,
          documentType: data.documentType ?? null,
        }

        const res = await fetch('/api/export-qualifications-csv', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          alert('Failed to generate CSV file.')
          return
        }

        const blob = await res.blob()
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'document_summary.csv'
        document.body.appendChild(a)
        a.click()
        a.remove()

        URL.revokeObjectURL(url)
      } catch (err) {
        console.error(err)
        alert('An error occurred while downloading the CSV.')
      }
    })
  }

  statusEl.classList.add('hidden')

  //Candidate overview
  personCard.classList.remove('hidden')

  const fullNameEl = document.getElementById('field-fullName')
  const dobEl = document.getElementById('field-dob')
  const enrolEl = document.getElementById('field-enrolment')
  const docTypeEl = document.getElementById('field-docType')

  if (fullNameEl) {
    fullNameEl.textContent = data.fullNames || data.firstName || 'Not provided'
  }

  if (dobEl) {
    dobEl.textContent = data.dateOfBirth || 'Not provided'
  }

  if (enrolEl) {
    enrolEl.textContent =
      data.enrolmentNumber || data.enrolmentNo || 'Not provided'
  }

  if (docTypeEl) {
    docTypeEl.textContent = data.documentType || 'Unknown'
  }

  //Qualifications table
  const qualifications: Qualification[] = Array.isArray(data.qualifications)
    ? (data.qualifications as Qualification[])
    : Array.isArray(data.fields?.qualifications)
    ? (data.fields.qualifications as Qualification[])
    : []

  qualSection.classList.remove('hidden')

  if (!qualifications.length) {
    qualBody.innerHTML =
      '<tr><td colspan="7" class="px-3 py-3 text-center text-slate-400">No qualifications were detected in this document.</td></tr>'
    qualCount.textContent = '0 qualifications found'
    return
  }

  qualCount.textContent =
    qualifications.length +
    ' qualification' +
    (qualifications.length > 1 ? 's' : '') +
    ' found'

  qualifications.forEach((q: Qualification, index: number) => {
    const tr = document.createElement('tr')

    const modulesText =
      Array.isArray(q.modules) && q.modules.length ? q.modules.join('; ') : '—'

    tr.innerHTML = `
      <td class="px-3 py-2 align-top text-xs text-slate-400">
        ${index + 1}
      </td>
      <td class="px-3 py-2 align-top font-medium text-slate-100">
        ${q.title || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.level || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.awardingBody || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.country || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${q.awardedDate || '—'}
      </td>
      <td class="px-3 py-2 align-top text-slate-200">
        ${modulesText}
      </td>
    `

    qualBody.appendChild(tr)
  })
})
