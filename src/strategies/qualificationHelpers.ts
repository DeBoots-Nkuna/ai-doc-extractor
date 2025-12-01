export function isObviouslyNotName(value: string | null | undefined): boolean {
  if (!value) return true

  const trimmed = value.trim()
  if (!trimmed) return true

  // Any digit => not a pure person name line
  if (/\d/.test(trimmed)) return true

  const upper = trimmed.toUpperCase()

  // Obvious headings / structural phrases
  if (/(AWARDED TO|TOEGEKEN AAN|OBTAINED AT|VERWERF AAN)/.test(upper)) {
    return true
  }

  // Institution / department keywords
  if (
    /(UNIV|UNIVERSITY|COLLEGE|TECHN|TECIIN|TECHNOLOGY|POLYTEC|INSTITUTE|INSTITUUT|FACULTY|DEPARTMENT)/.test(
      upper
    )
  ) {
    return true
  }

  // ID  label style
  if (
    /\b(STUDENT|IDENTITY|IDENTILY|LDENTITY|PASSPORT|ID)\b.*\b(NUMBER|NUMDER|NO\.?)\b/.test(
      upper
    )
  ) {
    return true
  }

  if (/\b(WITH|W1TH|WLTH|WOTH)\b.*\bFROM\b/.test(upper)) {
    return true
  }

  // Date headings
  if (/DATE OF (ISSUE|BIRTH)/.test(upper)) {
    return true
  }

  if (
    /(REGISTRAR|VICE-?CHANCELLOR|CHANCELLOR|COMMISSIONER OF OATHS|ATTORNEY R\.S\.A)/.test(
      upper
    )
  ) {
    return true
  }

  return false
}

// method to identify if text presents a name
function looksLikeName(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false

  // No digits in names on official docs
  if (/\d/.test(trimmed)) return false
  const cleaned = trimmed.replace(/[^A-Za-z\s'-]/g, ' ')
  const parts = cleaned.split(/\s+/).filter(Boolean)

  // A name should be 2–5 words max
  if (parts.length < 2 || parts.length > 5) return false

  return true
}

//method to extract name inbetween sentences
export function extractNameAroundAwardedTo(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const idx = lines.findIndex((l) => /awarded to|toegek[eé]n aan/i.test(l))
  if (idx === -1) return null

  const window = lines.slice(idx + 1, idx + 5)

  for (const line of window) {
    if (isObviouslyNotName(line)) continue

    if (looksLikeName(line)) {
      return line
    }
  }

  return null
}
//method to extract institution name
export function extractInstitutionName(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const idx = lines.findIndex((l) => /obtained at|verwerf aan/i.test(l))

  if (idx !== -1 && idx + 1 < lines.length) {
    const nextLine = lines[idx + 1]
    if (nextLine) {
      const cleaned = nextLine.replace(/\s{2,}/g, ' ').trim()
      return cleaned || null
    }
  }

  for (const line of lines) {
    const cleaned = line.replace(/\s{2,}/g, ' ').trim()
    if (!cleaned) continue

    const words = cleaned.split(/\s+/).filter(Boolean)
    if (words.length < 2) continue

    const upper = cleaned.toUpperCase()

    if (
      /(UNIVERSITY|UNIV OF TECHNOLOGY|UNIVERSITY OF TECHNOLOGY|COLLEGE|TECHNIKON|INSTITUTE|INSTITUUT)/.test(
        upper
      )
    ) {
      return cleaned
    }
  }

  return null
}

//method to format dates
export function extractIssueDate(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const idxEffect = lines.findIndex((l) => /with\s+effect\s+from/i.test(l))

  if (idxEffect !== -1 && idxEffect + 1 < lines.length) {
    const dateLine = lines[idxEffect + 1]
    if (dateLine) {
      // for things like "1990-01-01."
      const isoMatch = dateLine.match(/\b\d{4}-\d{2}-\d{2}\b/)
      if (isoMatch) return isoMatch[0]
      return dateLine.trim()
    }
  }

  // 1) ISO-style dates anywhere
  let match = text.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (match) return match[0]

  // 2) dd-MMM-yyyy style
  match = text.match(
    /\b\d{1,2}[-/ ](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-/ ]\d{2,4}\b/i
  )
  if (match) return match[0]

  return null
}

export function extractCandidateName(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const candidateLine = lines.find((l) => /candid[a-z]*\s+na\w*:/i.test(l))

  if (!candidateLine) return null

  // Take everything after the colon
  const parts = candidateLine.split(':')
  const afterColon = parts.length > 1 ? parts.slice(1).join(':') : ''
  if (!afterColon) return null

  // Cleaning OCR noise
  const cleaned = afterColon
    .replace(/[^A-Za-z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!cleaned) return null

  if (isObviouslyNotName(cleaned)) return null

  return cleaned
}
