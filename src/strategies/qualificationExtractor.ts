import { ExtractedFields } from '../extraction/types'
import { FieldConfig, runFieldConfigs } from '../extraction/runFieldConfigs'

const QUALIFICATION_CONFIGS: FieldConfig[] = [
  {
    field: 'fullNames',
    patterns: [
      /awarded to\s+(.+?)\s+(?:born|born on|with id|id no\.?)/i,
      /awarded to\s+(.+?)\s*obtained at/i,
      /whereas\s+(.+?)\s+had complied/i,
    ],
  },
  {
    field: 'qualificationName',
    patterns: [
      /(national diploma.+?)(?:with effect from|awarded to)/i,
      /(degree of\s+.+?)(?:having|has)/i,
      /(bachelor of [^,]+)/i,
    ],
  },
]

export function extractFromQualification(text: string): ExtractedFields {
  return runFieldConfigs(text, QUALIFICATION_CONFIGS)
}
