import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

import { SignupForm } from '@/components/auth/signup-form'

const makeSuccessResponse = () =>
  ({
    ok: true,
    json: () => Promise.resolve({ status: 'verify', email: 'john@example.com' }),
  }) as unknown as Response

const makeErrorResponse = (errorMsg: string) =>
  ({
    ok: false,
    json: () => Promise.resolve({ error: errorMsg }),
  }) as unknown as Response

describe('SignupForm', () => {
  const mockPush = vi.fn()
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    })
    global.fetch = vi.fn().mockResolvedValue(makeSuccessResponse())
  })

  it('renders username, email, password inputs and submit button', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error for username shorter than 3 characters', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'ab')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for username with invalid characters', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'John@Doe')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/lowercase letters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    // Use fireEvent.submit to bypass browser HTML5 constraint validation on type="email"
    fireEvent.submit(screen.getByLabelText('Email').closest('form')!)
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for password shorter than 8 characters', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Pass1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('calls fetch POST /api/auth/signup with JSON body on valid submit', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
      )
    })
    // Verify body contains correct values regardless of key order
    const body = JSON.parse(
      (vi.mocked(global.fetch).mock.calls[0][1] as RequestInit).body as string
    )
    expect(body).toEqual({ email: 'john@example.com', password: 'Password1', username: 'johndoe' })
  })

  it('calls toast.error with server error message when response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue(makeErrorResponse('Username is already taken'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username is already taken')
    })
  })

  it('redirects to /verify-email with email and username on success', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/verify-email')
      )
    })
    const pushArg = mockPush.mock.calls[0][0] as string
    expect(pushArg).toContain('email=john%40example.com')
    expect(pushArg).toContain('username=johndoe')
  })

  it('does NOT navigate when fetch response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue(makeErrorResponse('Username is already taken'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows "Creating account…" on button while loading', async () => {
    let resolveSignup!: (value: Response) => void
    vi.mocked(global.fetch).mockReturnValue(new Promise<Response>((res) => { resolveSignup = res }))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'Password1')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('button')).toHaveTextContent(/creating account/i)
    resolveSignup(makeSuccessResponse())
  })
})
