import { ExtractionFields } from './types'

//defining key type fields to extract
type SimpleFieldKey = Exclude<keyof ExtractionFields, 'qualifications'>

export type FieldConfig = {
  field: SimpleFieldKey
  patterns: RegExp[]
  postProcess?: (value: string) => string
}

export function runFieldConfigs(
  text: string,
  configs: FieldConfig[]
): Partial<ExtractionFields> {
  const cleaned = text.replace(/\s+/g, ' ').trim()
  const result: Partial<ExtractionFields> = {}

  for (const cfg of configs) {
    if (result[cfg.field]) continue

    for (const pattern of cfg.patterns) {
      const match = cleaned.match(pattern)
      if (match && match[1]) {
        const raw = match[1].trim()
        result[cfg.field] = cfg.postProcess ? cfg.postProcess(raw) : raw
        break
      }
    }
  }

  // retrieve firstname and surname from fullname field.
  if (!result.firstName && result.fullNames) {
    const [first] = result.fullNames.split(/\s+/)
    if (first) {
      result.firstName = first
    }
  }

  return result
}
