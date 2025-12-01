import { ExtractionFields } from '../extraction/types'
import { FieldConfig, runFieldConfigs } from '../extraction/runFieldConfigs'
import {
  extractInstitutionName,
  extractIssueDate,
  isObviouslyNotName,
  extractNameAroundAwardedTo,
  extractCandidateName,
} from './qualificationHelpers'

const QUALIFICATION_CONFIGS: FieldConfig[] = [
  {
    field: 'fullNames',
    patterns: [
      /awarded to\s+(.+?)\s+(?:born|born on|with id|id no\.?)/i,
      /awarded to\s+(.+?)\s*obtained at/i,
      /whereas\s+(.+?)\s+had complied/i,
    ],
  },
  {
    field: 'qualificationName',
    patterns: [
      /(national diploma.+?)(?:with effect from|awarded to)/i,
      /(degree of\s+.+?)(?:having|has)/i,
      /(bachelor of [^,]+)/i,
    ],
  },
]

export function extractFromQualification(
  text: string
): Partial<ExtractionFields> {
  // 1) Regex-based extraction (fullNames + qualificationName)
  const base = runFieldConfigs(text, QUALIFICATION_CONFIGS)
  const baseAny = base as any

  // Start with what regex gave us
  let fullNames: string | null = baseAny.fullNames ?? null
  let firstName: string | null = baseAny.firstName ?? null
  let surname: string | null = baseAny.surname ?? null

  // 2) Drop obviously-wrong stuff (IDs, headings, institution lines)
  if (isObviouslyNotName(fullNames)) fullNames = null
  if (isObviouslyNotName(firstName)) firstName = null
  if (isObviouslyNotName(surname)) surname = null

  //   if (!fullNames) {
  //     const candidate = extractCandidateName(text)
  //     if (candidate) {
  //       fullNames = candidate
  //     }
  //   }

  //   if (!fullNames) {
  //     const aroundAwarded = extractNameAroundAwardedTo(text)
  //     if (aroundAwarded) {
  //       fullNames = aroundAwarded
  //     }
  //   }

  // 4) Placeholder like "namet1 surnamet1"
  if (!fullNames || !firstName || !surname) {
    const placeholderMatch = text.match(/\b(name\w*)\s+(surname\w*)\b/i)

    if (placeholderMatch) {
      const placeholderFirst: string | null = placeholderMatch[1] ?? null
      const placeholderSurname: string | null = placeholderMatch[2] ?? null

      if (placeholderFirst && placeholderSurname) {
        fullNames = `${placeholderFirst} ${placeholderSurname}`
        firstName = placeholderFirst
        surname = placeholderSurname
      }
    }
  }

  // 5) If we now have fullNames but missing first/surname, split it
  if (fullNames && (!firstName || !surname)) {
    const parts = fullNames.split(/\s+/).filter(Boolean)

    if (parts.length >= 2) {
      const inferredFirst: string | null = parts[0] ?? null
      const inferredSurname: string | null =
        parts.length > 1 ? parts[parts.length - 1] ?? null : null

      if (!firstName && inferredFirst) {
        firstName = inferredFirst
      }
      if (!surname && inferredSurname) {
        surname = inferredSurname
      }
    }
  }

  // 6) Qualification type (Diploma / Degree / Certificate)
  let qualificationType: string | null = null
  if (/diploma/i.test(text)) {
    qualificationType = 'Diploma'
  } else if (/degree/i.test(text)) {
    qualificationType = 'Degree'
  } else if (/certificate/i.test(text)) {
    qualificationType = 'Certificate'
  }

  // 7) Institution + issue date
  const institutionName: string | null = extractInstitutionName(text)
  const issueDate: string | null = extractIssueDate(text)

  // 8) Return cleaned values – NO fallback to dirty base names
  return {
    ...base, // keep e.g. qualificationName from regex
    fullNames: fullNames ?? null,
    firstName: firstName ?? null,
    surname: surname ?? null,
    qualificationType: qualificationType ?? null,
    institutionName: institutionName ?? null,
    issueDate: issueDate ?? null,
  }
}
