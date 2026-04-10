function slugify(name: string | undefined): string {
  return name?.replace(/\s+/g, '-').toLowerCase() || 'resume'
}

export function getResumeFilename(name: string | undefined): string {
  return `${slugify(name)}.pdf`
}

export function getResumeDocxFilename(name: string | undefined): string {
  return `${slugify(name)}.docx`
}
