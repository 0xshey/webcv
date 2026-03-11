import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BasicsEditor } from '@/components/resume/basics-editor'

const mockDispatch = vi.hoisted(() => vi.fn())

vi.mock('@/components/providers/resume-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/providers/resume-provider')>()
  return {
    ...actual,
    useResume: vi.fn().mockReturnValue({
      dispatch: mockDispatch,
      isEditMode: true,
      content: {
        basics: { name: 'Jane Doe', email: 'jane@example.com', summary: '', label: 'Dev', phone: '555-0000', url: '' },
      },
    }),
  }
})

vi.mock('@/components/resume/rich-text-editor', () => ({
  RichTextEditor: ({
    value,
    onChange,
    id,
    placeholder,
  }: {
    value: string
    onChange: (v: string) => void
    id: string
    placeholder?: string
  }) => (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-testid="rich-text-editor"
    />
  ),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    from: () => ({ update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }) }),
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) },
  }),
}))

describe('BasicsEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Full Name, Email, Phone, and Website fields', () => {
    render(<BasicsEditor />)
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
  })

  it('renders the Summary field via mocked RichTextEditor', () => {
    render(<BasicsEditor />)
    expect(screen.getByTestId('rich-text-editor')).toBeInTheDocument()
  })

  it('pre-populates name input from context content.basics', () => {
    render(<BasicsEditor />)
    expect(screen.getByLabelText('Full Name')).toHaveValue('Jane Doe')
  })

  it('pre-populates email input from context content.basics', () => {
    render(<BasicsEditor />)
    expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com')
  })

  it('dispatches UPDATE_BASICS when the name field value changes', async () => {
    const user = userEvent.setup()
    render(<BasicsEditor />)
    const nameInput = screen.getByLabelText('Full Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'John Smith')
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'UPDATE_BASICS' })
      )
    })
  })

  it('dispatches UPDATE_BASICS when the email field value changes', async () => {
    const user = userEvent.setup()
    render(<BasicsEditor />)
    const emailInput = screen.getByLabelText('Email')
    await user.clear(emailInput)
    await user.type(emailInput, 'new@example.com')
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'UPDATE_BASICS' })
      )
    })
  })

  it('dispatches UPDATE_BASICS with empty name when name field is cleared', async () => {
    const user = userEvent.setup()
    render(<BasicsEditor />)
    const nameInput = screen.getByLabelText('Full Name')
    await user.clear(nameInput)
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'UPDATE_BASICS', payload: expect.objectContaining({ name: '' }) })
      )
    })
  })
})
