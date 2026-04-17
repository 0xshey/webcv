import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VerifyEmailForm } from '@/components/auth/verify-email-form'

const mockVerifyOtp = vi.fn()
const mockResend = vi.fn()
const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      resend: mockResend,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const defaultProps = { email: 'user@example.com', username: 'johndoe' }

beforeEach(() => {
  mockVerifyOtp.mockResolvedValue({ error: null })
  mockResend.mockResolvedValue({ error: null })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
})

describe('VerifyEmailForm', () => {
  it('renders OTP input and verify button', () => {
    render(<VerifyEmailForm {...defaultProps} />)
    expect(screen.getByLabelText('Verification code')).toBeDefined()
    expect(screen.getByRole('button', { name: /verify email/i })).toBeDefined()
  })

  it('verify button is disabled until 8 digits are entered', () => {
    render(<VerifyEmailForm {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /verify email/i })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '1234567' } })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '12345678' } })
    expect((btn as HTMLButtonElement).disabled).toBe(false)
  })

  it('strips non-numeric characters from OTP input', () => {
    render(<VerifyEmailForm {...defaultProps} />)
    const input = screen.getByLabelText('Verification code') as HTMLInputElement
    fireEvent.change(input, { target: { value: '1234abc5' } })
    expect(input.value).toBe('12345')
  })

  it('calls verifyOtp with email, token, and type "signup"', async () => {
    vi.useRealTimers()
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '12345678' } })
    fireEvent.submit(screen.getByRole('button', { name: /verify email/i }))
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'user@example.com',
        token: '12345678',
        type: 'signup',
      })
    })
  })

  it('redirects to /<username> on successful verification', async () => {
    vi.useRealTimers()
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '12345678' } })
    fireEvent.submit(screen.getByRole('button', { name: /verify email/i }))
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/johndoe')
    })
  })

  it('shows error message when verifyOtp fails', async () => {
    vi.useRealTimers()
    mockVerifyOtp.mockResolvedValue({ error: { message: 'Invalid OTP' } })
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '12345678' } })
    fireEvent.submit(screen.getByRole('button', { name: /verify email/i }))
    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeDefined()
    })
  })

  it('calls resend with type "signup" and email', async () => {
    vi.useRealTimers()
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /resend code/i }))
    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith({ type: 'signup', email: 'user@example.com' })
    })
  })

  it('starts 60s cooldown after successful resend', async () => {
    vi.useRealTimers()
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /resend code/i }))
    await waitFor(() => {
      expect(screen.getByText(/resend available in/i)).toBeDefined()
    })
  })

  it('hides resend button during cooldown and shows countdown', async () => {
    vi.useRealTimers()
    render(<VerifyEmailForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /resend code/i }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /resend code/i })).toBeNull())
    expect(screen.getByText(/resend available in/i)).toBeDefined()
  })
})
