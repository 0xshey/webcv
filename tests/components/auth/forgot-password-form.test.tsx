import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

beforeEach(() => {
  mockResetPasswordForEmail.mockResolvedValue({ error: null })
})

describe('ForgotPasswordForm', () => {
  it('renders email field and submit button', () => {
    render(<ForgotPasswordForm />)
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeDefined()
  })

  it('shows validation error for invalid email', async () => {
    render(<ForgotPasswordForm />)
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'not-an-email' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeDefined()
    })
  })

  it('calls resetPasswordForEmail and shows success state', async () => {
    render(<ForgotPasswordForm />)
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'user@example.com' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@example.com', {
        redirectTo: expect.stringContaining('/reset-password'),
      })
    })
    await waitFor(() => {
      expect(screen.getByText(/if that email is registered/i)).toBeDefined()
    })
  })

  it('always shows success even if email does not exist (no enumeration)', async () => {
    // Supabase returns no error for unknown emails in resetPasswordForEmail
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    render(<ForgotPasswordForm />)
    fireEvent.input(screen.getByLabelText('Email'), { target: { value: 'unknown@example.com' } })
    fireEvent.submit(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/if that email is registered/i)).toBeDefined()
    })
  })
})
