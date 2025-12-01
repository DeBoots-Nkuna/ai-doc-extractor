import { ExtractionFields } from '../extraction/types'

export function extractFromIdCard(text: string): Partial<ExtractionFields> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  let firstName: string | null = null
  let surname: string | null = null
  let fullNames: string | null = null

  // ---- helpers ---------------------------------------------------

  const looksLikeLabel = (value: string): boolean => {
    if (!value) return false
    const lower = value.toLowerCase()

    // explicit field labels
    if (lower.endsWith(':')) return true

    if (
      /(sex|sox|gender|nationality|natona?lity|identity\s+number|identity\s+numbor|id\s*number|date\s*of\s*birth|date\s*of\s*ditth|country\s*of\s*birth|status|citizen|rsa)/i.test(
        lower
      )
    ) {
      return true
    }

    return false
  }

  const isSurnameLabel = (line: string): boolean => {
    const lower = line.toLowerCase()
    const normalized = lower.replace(/[^a-z]/g, '') // remove weird chars

    if (!normalized) return false

    // normal case
    if (normalized.startsWith('surname')) return true

    // common OCR glitches for "surname" (e.g. "survamoe")
    if (
      normalized === 'survamoe' ||
      normalized === 'surnarne' ||
      normalized === 'surnarne'
    ) {
      return true
    }

    return false
  }

  const isNamesLabel = (line: string): boolean => {
    const lower = line.toLowerCase()
    const normalized = lower.replace(/[^a-z]/g, '')

    if (!normalized) return false

    // "Names", "Name"
    if (normalized.startsWith('names') || normalized === 'name') return true

    // OCR glitch "Narnes" from the sample ID
    if (normalized === 'narnes') return true

    return false
  }

  const extractValueAfterLabel = (index: number): string | null => {
    if (index < 0 || index >= lines.length) return null

    const current = lines[index]
    let candidate = current?.split(':')[1]?.trim() ?? ''

    // if value not on same line, check next line
    if (!candidate && index + 1 < lines.length) {
      const next = lines[index + 1]
      if (next && !looksLikeLabel(next)) {
        candidate = next.trim()
      }
    }

    return candidate || null
  }

  // ---- Surname ---------------------------------------------------

  const surnameIndex = lines.findIndex(isSurnameLabel)
  if (surnameIndex !== -1) {
    const candidate = extractValueAfterLabel(surnameIndex)
    if (candidate) {
      surname = candidate
    }
  }

  // ---- Names / first name ----------------------------------------

  const namesIndex = lines.findIndex(isNamesLabel)
  if (namesIndex !== -1) {
    const candidate = extractValueAfterLabel(namesIndex)
    if (candidate) {
      fullNames = candidate
      const parts = candidate.split(/\s+/).filter(Boolean)
      firstName = parts[0] ?? null
    }
  }

  // If we only got a single name value (e.g. just "ALEXANDER"),
  // treat it as firstName / fullNames and leave surname null.
  if (!fullNames && firstName) {
    fullNames = firstName
  }

  // ---- ID number (13 digits) -------------------------------------

  const idMatch = text.match(/\b\d{13}\b/)
  const idNumber = idMatch ? idMatch[0] : null

  return {
    firstName,
    surname,
    fullNames,
    idNumber,
  }
}
