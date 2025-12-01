import { DocumentType } from './types'

export function detectDocumentType(text: string): DocumentType {
  const lower = text.toLowerCase()

  // 13-digit SA ID present?
  const has13DigitId = /\b\d{13}\b/.test(text)

  // make ID card detection very forgiving
  const looksLikeIdCard =
    has13DigitId ||
    lower.includes('identity number') ||
    lower.includes('national identity card') ||
    lower.includes('identity card') ||
    lower.includes('identity caro') ||
    lower.includes('identity car') ||
    lower.includes('tity card')

  if (looksLikeIdCard) {
    return 'id_card'
  }

  if (lower.includes('passport') || lower.includes('pasipoti')) {
    return 'passport'
  }

  if (
    (lower.includes('diploma') && lower.includes('identity number')) ||
    lower.includes('diploma') ||
    lower.includes('degree') ||
    lower.includes('certificate') ||
    lower.includes('awarded to') ||
    lower.includes('this is to certify that the')
  ) {
    return 'qualification'
  }

  return 'unknown'
}
