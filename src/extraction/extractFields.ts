// export type DocumentType = 'passport' | 'id_card' | 'unknown'

// export interface ExtractedFields {
//   firstName: string | null
//   surname: string | null
//   idNumber: string | null
// }

// export interface ExtractedResult {
//   documentType: DocumentType
//   fields: ExtractedFields
//   rawText: string
// }

// export function extractFields(text: string): ExtractedResult {
//   const lines = text
//     .split('\n')
//     .map((l) => l.trim())
//     .filter(Boolean)

//   // 1) SA ID: 13 digits
//   const idMatch = text.match(/\b\d{13}\b/)
//   const idNumber: string | null = idMatch ? idMatch[0] : null

//   // 2) Line containing 'name'
//   const nameLine = lines.find((l) => l.toLowerCase().includes('name'))

//   let firstName: string | null = null
//   let surname: string | null = null

//   if (nameLine) {
//     // start with whole line as a string
//     let valuePart: string = nameLine

//     // if format like "Name: John Doe", take the part after ":"
//     if (nameLine.includes(':')) {
//       const partsAfterColon = nameLine.split(':')
//       // safely default to empty string if [1] is undefined
//       valuePart = (partsAfterColon[1] ?? '').trim()
//     }

//     const parts = valuePart.trim().split(/\s+/).filter(Boolean)

//     // with noUncheckedIndexedAccess, index access is string | undefined
//     if (parts.length > 0) {
//       firstName = parts[0] ?? null
//     }

//     if (parts.length > 1) {
//       surname = parts[parts.length - 1] ?? null
//     }
//   }

//   let documentType: DocumentType = 'unknown'
//   const lower = text.toLowerCase()
//   if (lower.includes('passport')) documentType = 'passport'
//   else if (lower.includes('identity card') || lower.includes('id card')) {
//     documentType = 'id_card'
//   }

//   return {
//     documentType,
//     fields: {
//       firstName,
//       surname,
//       idNumber,
//     },
//     rawText: text,
//   }
// }
