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
  qualificationType: string | null
  institutionName: string | null
  qualifications?: QualificationSummary[]
}

export interface AnalyzeResult {
  documentType: DocumentType
  fields: ExtractionFields

  rawText: string
}

//qualification types
export type QualificationSource =
  | 'city_and_guilds'
  | 'national_certificate'
  | 'unknown'

//qualification summary
export interface QualificationSummary {
  source: QualificationSource
  title: string
  level: string | null
  awardingBody: string | null
  country: string | null
  awardedDate: string | null
  modules: string[]
}
