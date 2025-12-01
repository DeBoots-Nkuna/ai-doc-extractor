import { DocumentType } from './types'

export function detectDocumentType(text: string): DocumentType {
  const lower = text.toLowerCase()

  const has13DigitId = /\b\d{13}\b/.test(text)

  // --- strong qualification hints ---
  const hasQualificationKeywords =
    lower.includes('diploma') ||
    lower.includes('degree') ||
    lower.includes('certificate') ||
    lower.includes('awarded to') ||
    lower.includes('this is to certify that the')

  // --- passport hints ---
  const hasPassportKeywords =
    lower.includes('passport') || lower.includes('pasipoti')

  // --- ID card hints (we *do not* blindly use "identity number") ---
  const hasIdCardKeywords =
    has13DigitId ||
    lower.includes('identity card') ||
    lower.includes('national identity card') ||
    lower.includes('identity caro') ||
    lower.includes('identity car') ||
    // only treat "identity number" as ID-card-ish if we *don’t* see qualification clues
    (lower.includes('identity number') && !hasQualificationKeywords)

  // 1) If it clearly looks like a qualification, prefer that.
  if (hasQualificationKeywords) {
    return 'qualification'
  }

  // 2) Passport
  if (hasPassportKeywords) {
    return 'passport'
  }

  // 3) ID card
  if (hasIdCardKeywords) {
    return 'id_card'
  }

  // 4) Fallback
  return 'unknown'
}
