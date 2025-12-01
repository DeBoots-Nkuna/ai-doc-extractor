import { QualificationSummary } from '../extraction/types'
import {
  normalise,
  extractCityAndGuildsLevel3,
  extractCityAndGuildsLevel5,
  extractNationalCertificate,
} from './helperMethods'

export function extractQualificationFromRawText(
  rawText: string
): QualificationSummary[] {
  const text = normalise(rawText)
  const results: QualificationSummary[] = []

  //retrieving National Certificate
  const nationalCertificate = extractNationalCertificate(text)

  //if statement
  if (nationalCertificate) {
    results.push(nationalCertificate)
  }

  // retrieving level 3 qualification
  const level3 = extractCityAndGuildsLevel3(text)

  //if statement
  if (level3) {
    results.push(level3)
  }

  //retrieving level 5 qualification
  const level5 = extractCityAndGuildsLevel5(text)
  if (level5) {
    results.push(level5)
  }

  return results
}
