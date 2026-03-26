import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddBlockButton } from '@/components/resume/block/add-button'

const mockDispatch = vi.hoisted(() => vi.fn())

vi.mock('@/components/providers/resume-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/providers/resume-provider')>()
  return {
    ...actual,
    useResume: vi.fn().mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: true,
    }),
  }
})

vi.mock('uuid', () => ({ v4: vi.fn().mockReturnValue('test-uuid-1234') }))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: () => ({ update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }) }),
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) },
  }),
}))

describe('AddBlockButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an "Add" button', () => {
    render(<AddBlockButton section="work" />)
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('dispatches ADD_BLOCK with section="work" when clicked', () => {
    render(<AddBlockButton section="work" />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD_BLOCK', section: 'work' })
    )
  })

  it('dispatched ADD_BLOCK item has an id property', () => {
    render(<AddBlockButton section="work" />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    const call = mockDispatch.mock.calls[0]?.[0] as { item: { id: string } }
    expect(call?.item?.id).toBe('test-uuid-1234')
  })

  it('dispatches ADD_BLOCK for education section', () => {
    render(<AddBlockButton section="education" />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD_BLOCK', section: 'education' })
    )
  })

  it('dispatches ADD_BLOCK for skills section', () => {
    render(<AddBlockButton section="skills" />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD_BLOCK', section: 'skills' })
    )
  })

  it('dispatches ADD_BLOCK for projects section', () => {
    render(<AddBlockButton section="projects" />)
    fireEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ADD_BLOCK', section: 'projects' })
    )
  })
})
