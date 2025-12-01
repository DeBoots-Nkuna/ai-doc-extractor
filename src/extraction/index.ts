import { AnalyzeResult, DocumentType, ExtractionFields } from './types'
import { detectDocumentType } from './detectDocumentType'
import { extractFromIdCard } from '../strategies/idCardExtractor'
import { extractFromPassport } from '../strategies/passportExtractor'
import { extractFromQualification } from '../strategies/qualificationExtractor'
import { extractQualificationFromRawText } from '../qualification/extractMultiQualifications'

//main function to analyze file document
export function analyzeDocument(rawText: string): AnalyzeResult {
  const documentType = detectDocumentType(rawText)

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
    qualifications: [],
  }

  //extracting field depending on doc type
  switch (documentType) {
    case 'id_card':
      fields = { ...fields, ...extractFromIdCard(rawText) }
      break
    case 'passport':
      fields = { ...fields, ...extractFromPassport(rawText) }
      break
    case 'qualification':
      fields = { ...fields, ...extractFromQualification(rawText) }
      break
    default:
      break
  }

  // retrieving multiple qualifications
  const qualifications = extractQualificationFromRawText(rawText)
  fields = { ...fields, qualifications }

  return { documentType, fields, rawText: rawText }
}
