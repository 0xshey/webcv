import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicResume } from '@/components/resume/public-resume'
import type { ResumeContent, ResumeStructure } from '@/lib/types'

const baseContent: ResumeContent = {
  basics: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-1234',
    url: 'https://janedoe.com',
    label: 'Software Engineer',
    summary: '<p>A brief summary</p>',
  },
}

const baseStructure: ResumeStructure = {
  sections: [
    { key: 'basics', visible: true },
    { key: 'work', visible: true },
    { key: 'education', visible: true },
    { key: 'skills', visible: false },
    { key: 'projects', visible: true },
  ],
  layout: { columns: 1 },
}

describe('PublicResume', () => {
  it('renders the name from basics', () => {
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.getByRole('heading', { name: 'Jane Doe' })).toBeInTheDocument()
  })

  it('renders the label when provided', () => {
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  })

  it('does NOT render the label when absent', () => {
    const content = { ...baseContent, basics: { ...baseContent.basics, label: undefined } }
    render(<PublicResume content={content} structure={baseStructure} />)
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument()
  })

  it('renders email in contact row', () => {
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })

  it('renders phone in contact row', () => {
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.getByText('555-1234')).toBeInTheDocument()
  })

  it('strips protocol from displayed url', () => {
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.getByText('janedoe.com')).toBeInTheDocument()
  })

  it('does NOT render sections with visible: false', () => {
    const content: ResumeContent = {
      ...baseContent,
      skills: [{ id: 's1', name: 'TypeScript' }],
    }
    render(<PublicResume content={content} structure={baseStructure} />)
    // Skills section is visible:false — its heading should not appear
    expect(screen.queryByText('Skills')).not.toBeInTheDocument()
  })

  it('does NOT render sections with zero items even if visible: true', () => {
    // work is visible:true but no items in content
    render(<PublicResume content={baseContent} structure={baseStructure} />)
    expect(screen.queryByText('Work Experience')).not.toBeInTheDocument()
  })

  it('renders visible work section when populated', () => {
    const content: ResumeContent = {
      ...baseContent,
      work: [{ id: 'w1', name: 'Acme', position: 'Dev', startDate: '2020-01' }],
    }
    render(<PublicResume content={content} structure={baseStructure} />)
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('renders sections in the order given by structure.sections', () => {
    const orderedStructure: ResumeStructure = {
      sections: [
        { key: 'basics', visible: true },
        { key: 'skills', visible: true },
        { key: 'work', visible: true },
      ],
      layout: { columns: 1 },
    }
    const content: ResumeContent = {
      ...baseContent,
      skills: [{ id: 's1', name: 'TypeScript' }],
      work: [{ id: 'w1', name: 'Acme', position: 'Dev', startDate: '2020-01' }],
    }
    render(<PublicResume content={content} structure={orderedStructure} />)
    const headings = screen.getAllByRole('heading', { level: 2 })
    const headingTexts = headings.map((h) => h.textContent?.trim())
    const skillsIdx = headingTexts.findIndex((t) => t?.includes('Skills'))
    const workIdx = headingTexts.findIndex((t) => t?.includes('Work'))
    expect(skillsIdx).toBeLessThan(workIdx)
  })
})
