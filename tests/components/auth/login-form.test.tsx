import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const mockSignIn = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      signInWithPassword: mockSignIn,
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: () => ({
      update: () => ({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { username: 'johndoe' } }) }) }),
    }),
  }),
}))

import { LoginForm } from '@/components/auth/login-form'

describe('LoginForm', () => {
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
    mockSignIn.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
  })

  it('renders email and password inputs and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation error when email is empty on submit', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('calls supabase.auth.signInWithPassword with correct credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      })
    })
  })

  it('calls router.push("/<username>") on successful login', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/johndoe')
    })
  })

  it('calls router.refresh() on successful login', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('calls toast.error with error.message when signIn returns an error', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials')
    })
  })

  it('does NOT navigate when signIn returns an error', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  it('shows "Signing in…" text on button while loading', async () => {
    let resolveSignIn!: (value: unknown) => void
    mockSignIn.mockReturnValue(new Promise((res) => { resolveSignIn = res }))
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByRole('button')).toHaveTextContent(/signing in/i)
    resolveSignIn({ data: { user: { id: 'user-123' } }, error: null })
  })

  it('renders a "Forgot password?" link pointing to /forgot-password', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /forgot password/i })
    expect(link).toBeInTheDocument()
    expect((link as HTMLAnchorElement).getAttribute('href')).toBe('/forgot-password')
  })
})
