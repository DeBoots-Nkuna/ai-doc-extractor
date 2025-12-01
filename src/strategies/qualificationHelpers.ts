export function isObviouslyNotName(value: string | null | undefined): boolean {
  if (!value) return true

  const trimmed = value.trim()
  if (!trimmed) return true

  // Any digit => almost certainly not a pure name line
  if (/\d/.test(trimmed)) return true

  const upper = trimmed.toUpperCase()

  // Obvious headings / structural phrases
  if (
    /(AWARDED TO|TOEGEKEN AAN|OBTAINED AT|VERWERF AAN|WITH EFFECT FROM)/.test(
      upper
    )
  ) {
    return true
  }

  // Institution / department keywords
  if (
    /(UNIV|UNIVERSITY|COLLEGE|TECHN|TECIIN|POLYTEC|INSTITUTE|INSTITUUT|FACULTY|DEPARTMENT)/.test(
      upper
    )
  ) {
    return true
  }

  // ID / identity / student / passport number labels
  if (
    (/\bIDENTITY\b/.test(upper) && /\b(NUMBER|NO\.?)\b/.test(upper)) ||
    (/\bID\b/.test(upper) && /\b(NUMBER|NO\.?)\b/.test(upper)) ||
    (/\bPASSPORT\b/.test(upper) && /\b(NUMBER|NO\.?)\b/.test(upper)) ||
    (/\bSTUDENT\b/.test(upper) && /\b(NUMBER|NO\.?)\b/.test(upper))
  ) {
    return true
  }

  // Date labels – also not names
  if (/DATE OF (ISSUE|BIRTH)/.test(upper)) {
    return true
  }

  return false
}

// Internal helper: does this line "shape" look like a human name?
function looksLikeName(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false

  // No digits in names on official docs
  if (/\d/.test(trimmed)) return false

  // Strip punctuation except spaces / apostrophe / hyphen
  const cleaned = trimmed.replace(/[^A-Za-z\s'-]/g, ' ')
  const parts = cleaned.split(/\s+/).filter(Boolean)

  // A name should be 2–5 words max
  if (parts.length < 2 || parts.length > 5) return false

  return true
}

// Try to find a name in the few lines after "AWARDED TO / TOEGEKEN AAN".
export function extractNameAroundAwardedTo(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const idx = lines.findIndex((l) => /awarded to|toegek[eé]n aan/i.test(l))
  if (idx === -1) return null

  const window = lines.slice(idx + 1, idx + 5)

  for (const line of window) {
    // Skip obviously-not-name lines (IDs, headings, institution lines)
    if (isObviouslyNotName(line)) continue

    if (looksLikeName(line)) {
      return line
    }
  }

  return null
}

// Institution: prefer the line after "OBTAINED AT / VERWERF AAN",
// otherwise fall back to scanning for institution-ish keywords.
export function extractInstitutionName(text: string): string | null {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  // 1) Pattern: VERWERF AAN / OBTAINED AT
  const idx = lines.findIndex((l) => /obtained at|verwerf aan/i.test(l))

  if (idx !== -1 && idx + 1 < lines.length) {
    const nextLine = lines[idx + 1]
    if (nextLine) {
      return nextLine.replace(/\s{2,}/g, ' ').trim()
    }
  }

  // 2) Fallback: look for institution-ish keywords
  for (const line of lines) {
    const upper = line.toUpperCase()
    if (
      /(UNIV|UNIVERSITY|COLLEGE|TECHN|TECIIN|POLYTEC|INSTITUTE|INSTITUUT)/.test(
        upper
      )
    ) {
      return line.trim()
    }
  }

  return null
}

// Issue date: try "WITH EFFECT FROM" first, then ISO and other formats.
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
