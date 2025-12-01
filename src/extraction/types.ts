// Basic doc categories
export type DocumentType = 'id_card' | 'passport' | 'qualification' | 'unknown'

export interface ExtractedFields {
  firstName?: string
  surname?: string
  fullNames?: string

  idNumber?: string
  passportNumber?: string

  dateOfBirth?: string
  issueDate?: string
  expiryDate?: string

  // free space for extra info you might show later
  qualificationName?: string
}
