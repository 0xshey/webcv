export function formatDate(d: string | undefined): string {
  if (!d) return 'Present'
  const parts = d.split('-')
  const year = parts[0] ?? ''
  const month = parts[1]
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
