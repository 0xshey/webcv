import React from 'react'
import { render } from '@testing-library/react'
import { ResumeProvider } from '@/components/providers/resume-provider'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import { minimalContent, minimalStructure } from './resume-fixtures'

interface ProviderOptions {
  content?: ResumeContent
  structure?: ResumeStructure
  resumeId?: string
}

export function renderWithResumeProvider(
  ui: React.ReactElement,
  options?: ProviderOptions
) {
  return render(
    <ResumeProvider
      initialContent={options?.content ?? minimalContent}
      initialStructure={options?.structure ?? minimalStructure}
      resumeId={options?.resumeId ?? 'test-resume-id'}
    >
      {ui}
    </ResumeProvider>
  )
}
