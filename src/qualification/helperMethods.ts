import { QualificationSummary } from '../extraction/types'

//method to normalize raw text
export function normalise(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').toLowerCase()
}

//method to extract national certificate
export function extractNationalCertificate(
  text: string
): QualificationSummary | null {
  const hasNationalCert =
    text.includes('national certificate') &&
    text.includes('instrumentation control')

  if (!hasNationalCert) return null

  const yearMatch = text.match(/31st day of december\s+(19|20)\d{2}/)
  const awardedDate = yearMatch ? '31 December ' + yearMatch[0].slice(-4) : null

  return {
    source: 'national_certificate',
    title: 'National Certificate in Instrumentation Control',
    level: 'National Certificate',
    awardingBody: 'Ministry of Higher Education',
    country: 'Zimbabwe',
    awardedDate,
    modules: [],
  }
}

//method to extract level 3 qualification
export function extractCityAndGuildsLevel3(
  text: string
): QualificationSummary | null {
  const hasLevel3 = text.includes(
    'level 3 ivq technician diploma in electrical and electronic'
  )

  if (!hasLevel3) return null

  const modules: string[] = []
  if (text.includes('engineering fundamentals 2')) {
    modules.push('Engineering Fundamentals 2')
  }
  if (text.includes('electronics')) {
    modules.push('Electronics')
  }
  if (text.includes('computer aided communication practical assignments')) {
    modules.push('Computer Aided Communication Practical Assignments')
  }
  if (text.includes('electronic practical assignments')) {
    modules.push('Electronic Practical Assignments')
  }

  return {
    source: 'city_and_guilds',
    title:
      'Level 3 IVQ Technician Diploma in Electrical and Electronic Engineering',
    level: 'Level 3',
    awardingBody: 'The City and Guilds of London Institute',
    country: null,
    awardedDate: null,
    modules,
  }
}

//method to extract level 5 qualification
export function extractCityAndGuildsLevel5(
  text: string
): QualificationSummary | null {
  const hasLevel5 =
    text.includes(
      'level 5 ivq advanced technician diploma in electrical and electronic'
    ) || text.includes('level 5 ivq advanced technician diplorra in electrical')

  if (!hasLevel5) return null

  const modules: string[] = []
  if (text.includes('advanced electrical principles')) {
    modules.push('Advanced Electrical Principles')
  }
  if (text.includes('engineering project practical assignment')) {
    modules.push('Engineering Project Practical Assignment')
  }
  if (text.includes('control systems and applications')) {
    modules.push('Control Systems and Applications')
  }

  return {
    source: 'city_and_guilds',
    title:
      'Level 5 IVQ Advanced Technician Diploma in Electrical and Electronic Engineering',
    level: 'Level 5',
    awardingBody: 'The City and Guilds of London Institute',
    country: null,
    awardedDate: null,
    modules,
  }
}
