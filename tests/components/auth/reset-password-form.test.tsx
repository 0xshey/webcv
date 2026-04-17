import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

const mockUpdateUser = vi.fn()
let authStateCallback: ((event: string) => void) | null = null

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: (cb: (event: string) => void) => {
        authStateCallback = cb
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      },
      updateUser: mockUpdateUser,
    },
  }),
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

beforeEach(() => {
  authStateCallback = null
  mockUpdateUser.mockResolvedValue({ error: null })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ResetPasswordForm', () => {
  it('shows checking state initially', () => {
    render(<ResetPasswordForm />)
    expect(screen.getByText(/verifying link/i)).toBeDefined()
  })

  it('shows invalid state after timeout with no PASSWORD_RECOVERY event', async () => {
    render(<ResetPasswordForm />)
    await act(async () => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText(/invalid or has expired/i)).toBeDefined()
  })

  it('shows form when PASSWORD_RECOVERY event fires before timeout', async () => {
    render(<ResetPasswordForm />)
    await act(async () => {
      authStateCallback?.('PASSWORD_RECOVERY')
    })
    expect(screen.getByLabelText('New password')).toBeDefined()
    expect(screen.getByLabelText('Confirm new password')).toBeDefined()
  })

  it('shows form even if PASSWORD_RECOVERY fires after a short delay', async () => {
    render(<ResetPasswordForm />)
    await act(async () => {
      vi.advanceTimersByTime(500) // still within the 1500ms window
      authStateCallback?.('PASSWORD_RECOVERY')
    })
    expect(screen.getByLabelText('New password')).toBeDefined()
  })

  it('rejects password without uppercase', async () => {
    vi.useRealTimers()
    render(<ResetPasswordForm />)
    await act(async () => { authStateCallback?.('PASSWORD_RECOVERY') })

    fireEvent.input(screen.getByLabelText('New password'), { target: { value: 'password1' } })
    fireEvent.input(screen.getByLabelText('Confirm new password'), { target: { value: 'password1' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/uppercase/i)).toBeDefined()
    })
  })

  it('rejects mismatched passwords', async () => {
    vi.useRealTimers()
    render(<ResetPasswordForm />)
    await act(async () => { authStateCallback?.('PASSWORD_RECOVERY') })

    fireEvent.input(screen.getByLabelText('New password'), { target: { value: 'Password1' } })
    fireEvent.input(screen.getByLabelText('Confirm new password'), { target: { value: 'Password2' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(screen.getByText(/do not match/i)).toBeDefined()
    })
  })

  it('calls updateUser with new password on valid submit', async () => {
    vi.useRealTimers()
    render(<ResetPasswordForm />)
    await act(async () => { authStateCallback?.('PASSWORD_RECOVERY') })

    fireEvent.input(screen.getByLabelText('New password'), { target: { value: 'Password1' } })
    fireEvent.input(screen.getByLabelText('Confirm new password'), { target: { value: 'Password1' } })
    fireEvent.submit(screen.getByRole('button', { name: /update password/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'Password1' })
    })
  })
})
