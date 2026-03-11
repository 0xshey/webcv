import type { ResumeContent, ResumeStructure } from '@/lib/types'
import type { ResumeState } from '@/components/providers/resume-provider'

export const minimalContent: ResumeContent = {
  basics: { name: 'Jane Doe', email: 'jane@example.com', summary: '' },
}

export const minimalStructure: ResumeStructure = {
  sections: [
    { key: 'basics', visible: true },
    { key: 'work', visible: true },
    { key: 'education', visible: true },
    { key: 'skills', visible: true },
    { key: 'projects', visible: true },
    { key: 'volunteer', visible: true },
    { key: 'awards', visible: true },
    { key: 'certificates', visible: true },
    { key: 'publications', visible: true },
    { key: 'languages', visible: true },
    { key: 'interests', visible: true },
    { key: 'references', visible: true },
  ],
  layout: { columns: 1 },
}

export function makeState(overrides?: Partial<ResumeState>): ResumeState {
  return {
    content: minimalContent,
    structure: minimalStructure,
    isDirty: false,
    isSaving: false,
    error: null,
    resumeId: 'test-resume-id',
    ...overrides,
  }
}
