import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import { SectionHeader } from '@/components/resume/section-header'

const mockDispatch = vi.hoisted(() => vi.fn())

vi.mock('@/components/providers/resume-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/providers/resume-provider')>()
  return {
    ...actual,
    useResume: vi.fn().mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: false,
    }),
  }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: () => ({ update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }) }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }), onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) },
  }),
}))

import { useResume } from '@/components/providers/resume-provider'

describe('SectionHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useResume).mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: false,
      content: { basics: { name: '', email: '', summary: '' } },
      structure: { sections: [], layout: { columns: 1 } },
      isDirty: false,
      isSaving: false,
      error: null,
      resumeId: 'test-id',
      toggleEditMode: vi.fn(),
    })
  })

  it('renders the section label for "work"', () => {
    render(<SectionHeader sectionKey="work" visible={true} />)
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
  })

  it('renders the section label for "education"', () => {
    render(<SectionHeader sectionKey="education" visible={true} />)
    expect(screen.getByText('Education')).toBeInTheDocument()
  })

  it('renders the section label for "skills"', () => {
    render(<SectionHeader sectionKey="skills" visible={true} />)
    expect(screen.getByText('Skills')).toBeInTheDocument()
  })

  it('renders the section label for "basics"', () => {
    render(<SectionHeader sectionKey="basics" visible={true} />)
    expect(screen.getByText('Basics')).toBeInTheDocument()
  })

  it('does NOT render the toggle button when isEditMode is false', () => {
    vi.mocked(useResume).mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: false,
      content: { basics: { name: '', email: '', summary: '' } },
      structure: { sections: [], layout: { columns: 1 } },
      isDirty: false,
      isSaving: false,
      error: null,
      resumeId: 'test-id',
      toggleEditMode: vi.fn(),
    })
    render(<SectionHeader sectionKey="work" visible={true} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the toggle button when isEditMode is true and sectionKey is not basics', () => {
    vi.mocked(useResume).mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: true,
      content: { basics: { name: '', email: '', summary: '' } },
      structure: { sections: [], layout: { columns: 1 } },
      isDirty: false,
      isSaving: false,
      error: null,
      resumeId: 'test-id',
      toggleEditMode: vi.fn(),
    })
    render(<SectionHeader sectionKey="work" visible={true} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does NOT render the toggle button for basics section even in edit mode', () => {
    vi.mocked(useResume).mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: true,
      content: { basics: { name: '', email: '', summary: '' } },
      structure: { sections: [], layout: { columns: 1 } },
      isDirty: false,
      isSaving: false,
      error: null,
      resumeId: 'test-id',
      toggleEditMode: vi.fn(),
    })
    render(<SectionHeader sectionKey="basics" visible={true} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('dispatches TOGGLE_SECTION action when toggle button is clicked', () => {
    vi.mocked(useResume).mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: true,
      content: { basics: { name: '', email: '', summary: '' } },
      structure: { sections: [], layout: { columns: 1 } },
      isDirty: false,
      isSaving: false,
      error: null,
      resumeId: 'test-id',
      toggleEditMode: vi.fn(),
    })
    render(<SectionHeader sectionKey="work" visible={true} />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'TOGGLE_SECTION', key: 'work' })
  })
})
