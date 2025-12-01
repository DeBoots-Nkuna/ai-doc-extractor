import { AnalyzeResult, DocumentType, ExtractionFields } from './types'
import { detectDocumentType } from './detectDocumentType'
import { extractFromIdCard } from '../strategies/idCardExtractor'
import { extractFromPassport } from '../strategies/passportExtractor'
import { extractFromQualification } from '../strategies/qualificationExtractor'
export function analyzeDocument(text: string): AnalyzeResult {
  const documentType = detectDocumentType(text)

  let fields: ExtractionFields = {
    firstName: null,
    surname: null,
    fullNames: null,
    idNumber: null,
    passportNumber: null,
    dateOfBirth: null,
    expiryDate: null,
    issueDate: null,
    qualificationName: null,
    qualificationType: null,
    institutionName: null,
  }

  switch (documentType) {
    case 'id_card':
      fields = { ...fields, ...extractFromIdCard(text) }
      break
    case 'passport':
      fields = { ...fields, ...extractFromPassport(text) }
      break
    case 'qualification':
      fields = { ...fields, ...extractFromQualification(text) }
      break
    default:
      // leave the defaults (all null)
      break
  }

  return { documentType, fields, rawText: text }
}
