import { ExtractionFields } from '../extraction/types'

export function extractFromIdCard(text: string): Partial<ExtractionFields> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  let firstName: string | null = null
  let surname: string | null = null
  let fullNames: string | null = null

  // Heuristic: does this line look like a field label, not a name?
  const looksLikeLabel = (value: string): boolean => {
    const lower = value.toLowerCase()
    if (!value) return false
    if (value.endsWith(':')) return true
    return /(sex|sox|gender|nationality|identity|id\s*number|date\s*of\s*birth|rsa)/i.test(
      lower
    )
  }

  // -------- Surname --------
  const surnameIndex = lines.findIndex((l) =>
    l.toLowerCase().startsWith('surname')
  )
  if (surnameIndex !== -1) {
    const current = lines[surnameIndex]
    let candidate = current?.split(':')[1]?.trim() ?? ''

    if (!candidate) {
      const next = lines[surnameIndex + 1]
      if (next && !looksLikeLabel(next)) {
        candidate = next.trim()
      }
    }

    if (candidate) {
      surname = candidate
    }
  }

  // -------- Names / first name --------
  const namesIndex = lines.findIndex((l) => l.toLowerCase().startsWith('names'))
  if (namesIndex !== -1) {
    const current = lines[namesIndex]
    let candidate = current?.split(':')[1]?.trim() ?? ''

    if (!candidate) {
      const next = lines[namesIndex + 1]
      if (next && !looksLikeLabel(next)) {
        candidate = next.trim()
      }
    }

    if (candidate) {
      fullNames = candidate
      const parts = candidate.split(/\s+/).filter(Boolean)
      firstName = parts[0] ?? null
    }
  }

  // -------- ID number (13 digits) --------
  const idMatch = text.match(/\b\d{13}\b/)
  const idNumber = idMatch ? idMatch[0] : null

  return {
    firstName,
    surname,
    fullNames,
    idNumber,
  }
}
