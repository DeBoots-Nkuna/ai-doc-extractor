import { DocumentType } from './types'
import { looksLikeIdCard } from '../strategies/idCardHelper'

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

  // --- ID card hints (now using helper + 13-digit ID) ---
  const hasIdCardKeywords = looksLikeIdCard(text) || has13DigitId

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
