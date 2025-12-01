import { ExtractedFields } from '../extraction/types'

//function date formatter
function parseMrzDate(yyMMdd: string): string | undefined {
  if (!/^\d{6}$/.test(yyMMdd)) return
  return yyMMdd
}

export function extractFromPassport(text: string): ExtractedFields {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const mrzLines = lines.filter(
    (l) => l.length >= 30 && l.includes('<') && /[A-Z]/.test(l)
  )

  const result: ExtractedFields = {}

  if (mrzLines.length >= 2) {
    const [line1Raw, line2Raw] = mrzLines
    if (!line1Raw || !line2Raw) {
      return result
    }

    const line1 = line1Raw.replace(/ /g, '')
    const line2 = line2Raw.replace(/ /g, '')

    // Names from line1
    const namePart = line1.slice(5) // skip "P<" + country
    const [surnamePart = '', givenPart = ''] = namePart.split('<<')
    const surname = surnamePart.replace(/</g, ' ').trim()
    const givenNames = givenPart.replace(/</g, ' ').trim()

    if (surname) {
      result.surname = surname
    }
    if (givenNames) {
      result.fullNames = `${givenNames} ${surname}`.trim()
      const [firstName] = givenNames.split(/\s+/)
      if (firstName) {
        result.firstName = firstName
      }
    }

    // Passport number + dates from line2
    const passportNumber = line2.slice(0, 9).replace(/</g, '')
    if (passportNumber) result.passportNumber = passportNumber

    const dobRaw = line2.slice(13, 19)
    const expRaw = line2.slice(21, 27)

    const dob = parseMrzDate(dobRaw)
    const exp = parseMrzDate(expRaw)

    if (dob) result.dateOfBirth = dob
    if (exp) result.expiryDate = exp
  }

  return result
}
