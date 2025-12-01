export type DocumentType = 'passport' | 'id_card' | 'qualification' | 'unknown'

export interface ExtractionFields {
  // person
  firstName: string | null
  surname: string | null
  fullNames: string | null

  // id docs
  idNumber: string | null

  // passport
  passportNumber: string | null
  dateOfBirth: string | null
  expiryDate: string | null
  issueDate: string | null

  // qualifications
  qualificationName: string | null
}

export interface AnalyzeResult {
  documentType: DocumentType
  fields: ExtractionFields
  rawText: string
}
