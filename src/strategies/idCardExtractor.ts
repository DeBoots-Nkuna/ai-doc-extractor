import { ExtractedFields } from '../extraction/types'
import { FieldConfig, runFieldConfigs } from '../extraction/runFieldConfigs'

const ID_CARD_CONFIGS: FieldConfig[] = [
  {
    field: 'surname',
    patterns: [/Surname:\s*([A-Za-z]+(?:\s+[A-Za-z]+)*)/i],
  },
  {
    field: 'fullNames',
    patterns: [/Names?:\s*([A-Za-z]+(?:\s+[A-Za-z]+)*)/i],
  },
  {
    field: 'idNumber',
    patterns: [/Identity\s+Number:\s*([0-9]{6,})/i, /\b(\d{13})\b/],
  },
]

export function extractFromIdCard(text: string): ExtractedFields {
  return runFieldConfigs(text, ID_CARD_CONFIGS)
}
