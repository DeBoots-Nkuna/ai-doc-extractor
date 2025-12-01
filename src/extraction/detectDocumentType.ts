import { DocumentType } from './types'

export function detectDocumentType(text: string): DocumentType {
  const lower = text.toLowerCase()

  if (lower.includes('identity number') || lower.includes('id card')) {
    return 'id_card'
  }

  if (lower.includes('passport') || lower.includes('pasipoti')) {
    return 'passport'
  }

  if (
    lower.includes('diploma') ||
    lower.includes('degree') ||
    lower.includes('certificate') ||
    lower.includes('awarded to') ||
    lower.includes('this is to certify that')
  ) {
    return 'qualification'
  }

  return 'unknown'
}
