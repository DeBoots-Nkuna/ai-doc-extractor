// idCardHelper.ts

export function looksLikeIdCard(text: string): boolean {
  const upper = text.toUpperCase()

  // "NATIONAL IDENTITY CARD" and broken variants
  if (/NATIONAL\s+IDENT/.test(upper)) return true
  if (/(IDENTITY|DENTITY|TITY)\s+CARD/.test(upper)) return true // catches "TITY CARD"

  // "Identity number" + OCR glitches ("ldentily NumDer", etc.)
  const hasIdentityWord = /(IDENTITY|IDENTILY|LDENTITY|LDENTILY)/.test(upper)
  const hasNumberWord = /(NUMBER|NUMDER|NUMBOR|NUMB)/.test(upper)

  if (hasIdentityWord && hasNumberWord) return true

  // Fallback: RSA + DATE OF BIRTH + some IDENT text is very typical of SA IDs
  if (
    upper.includes('RSA') &&
    /DATE OF BIRTH|DATE OF BH1H|DATE OF BIRH/.test(upper) &&
    /IDENT/.test(upper)
  ) {
    return true
  }

  return false
}
