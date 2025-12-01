import { DocumentType, ExtractedFields } from './types'
import { detectDocumentType } from './detectDocumentType'
import { extractFromIdCard } from '../strategies/idCardExtractor'
import { extractFromPassport } from '../strategies/passportExtractor'
import { extractFromQualification } from '../strategies/qualificationExtractor'

export function analyzeExtractedText(text: string): {
  documentType: DocumentType
  fields: ExtractedFields
} {
  const documentType = detectDocumentType(text)
  let fields: ExtractedFields = {}

  switch (documentType) {
    case 'id_card':
      fields = extractFromIdCard(text)
      break
    case 'passport':
      fields = extractFromPassport(text)
      break
    case 'qualification':
      fields = extractFromQualification(text)
      break
    default:
      fields = {}
  }

  return { documentType, fields }
}
