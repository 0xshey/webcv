import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const mockSetSession = vi.hoisted(() => vi.fn().mockResolvedValue({}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      setSession: mockSetSession,
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}))

import { SignupForm } from '@/components/auth/signup-form'

const makeSuccessResponse = () =>
  ({
    ok: true,
    json: () =>
      Promise.resolve({
        session: { access_token: 'access-123', refresh_token: 'refresh-456' },
      }),
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
    await user.type(screen.getByLabelText('Password'), 'short')
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
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'john@example.com', password: 'password123', username: 'johndoe' }),
        })
      )
    })
  })

  it('calls toast.error with server error message when response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue(makeErrorResponse('Username is already taken'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Username is already taken')
    })
  })

  it('calls supabase.auth.setSession with access_token and refresh_token from response', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'access-123',
        refresh_token: 'refresh-456',
      })
    })
  })

  it('calls router.push("/dashboard") on success', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('does NOT navigate when fetch response is not ok', async () => {
    vi.mocked(global.fetch).mockResolvedValue(makeErrorResponse('Username is already taken'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('shows "Creating account…" on button while loading', async () => {
    let resolveSignup!: (value: Response) => void
    vi.mocked(global.fetch).mockReturnValue(new Promise<Response>((res) => { resolveSignup = res }))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Username'), 'johndoe')
    await user.type(screen.getByLabelText('Email'), 'john@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByRole('button')).toHaveTextContent(/creating account/i)
    resolveSignup(makeSuccessResponse())
  })
})
