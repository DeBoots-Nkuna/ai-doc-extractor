//helper method to format csv data
export function escapeCsv(value: string | null | undefined): string {
  if (value == null) return ''
  const v = String(value)
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}
