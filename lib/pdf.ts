export function getResumeFilename(name: string | undefined): string {
  return `${name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`
}
