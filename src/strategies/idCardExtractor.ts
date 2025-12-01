import { ExtractionFields } from '../extraction/types'

export function extractFromIdCard(text: string): Partial<ExtractionFields> {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  let firstName: string | null = null
  let surname: string | null = null
  let fullNames: string | null = null

  // surname is usually on the line after "Surname"
  const surnameIndex = lines.findIndex((l) =>
    l.toLowerCase().startsWith('surname')
  )
  const surnameLine = surnameIndex !== -1 ? lines[surnameIndex + 1] : undefined
  if (surnameLine !== undefined) {
    surname = surnameLine.trim() || null
  }

  // names are usually on the line after "Names"
  const namesIndex = lines.findIndex((l) => l.toLowerCase().startsWith('names'))
  const namesLine = namesIndex !== -1 ? lines[namesIndex + 1] : undefined
  if (namesLine !== undefined) {
    const trimmed = namesLine.trim()
    const parts = namesLine.split(/\s+/).filter(Boolean)
    fullNames = trimmed || null
    firstName = parts[0] ?? null
  }

  // 13-digit ID
  const idMatch = text.match(/\b\d{13}\b/)
  const idNumber = idMatch ? idMatch[0] : null

  return {
    firstName,
    surname,
    fullNames,
    idNumber,
  }
}
