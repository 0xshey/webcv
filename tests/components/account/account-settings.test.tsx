import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountSettings } from '@/components/account/account-settings'

const mockSignInWithPassword = vi.fn()
const mockUpdateUser = vi.fn()
const mockSignOut = vi.fn()
const mockPush = vi.fn()

const mockUpdate = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
    },
    from: () => ({ update: () => ({ eq: mockUpdate }) }),
  }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const defaultProps = { userId: 'u1', email: 'user@example.com', username: 'testuser' }

beforeEach(() => {
  vi.clearAllMocks()
  mockSignInWithPassword.mockResolvedValue({ error: null })
  mockUpdateUser.mockResolvedValue({ error: null })
  mockSignOut.mockResolvedValue({})
  mockUpdate.mockResolvedValue({ error: null })
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) })
})

// ── Settings rows ─────────────────────────────────────────────────────────────

describe('AccountSettings rows', () => {
  it('renders all action rows', () => {
    render(<AccountSettings {...defaultProps} />)
    expect(screen.getByText('Change username')).toBeDefined()
    expect(screen.getByText('Change password')).toBeDefined()
    expect(screen.getByText('Change email')).toBeDefined()
    expect(screen.getByText('Delete account')).toBeDefined()
  })

  it('renders profile link copy button', () => {
    render(<AccountSettings {...defaultProps} />)
    expect(screen.getByLabelText('Copy profile link')).toBeDefined()
  })

  it('does not show password fields until the row is clicked', () => {
    render(<AccountSettings {...defaultProps} />)
    expect(screen.queryByLabelText('Current password')).toBeNull()
  })

  it('does not show email field until the row is clicked', () => {
    render(<AccountSettings {...defaultProps} />)
    expect(screen.queryByLabelText('New email address')).toBeNull()
  })

  it('does not show delete confirmation until the row is clicked', () => {
    render(<AccountSettings {...defaultProps} />)
    expect(screen.queryByLabelText('Confirm account deletion')).toBeNull()
  })
})

// ── Copy Link Row ─────────────────────────────────────────────────────────────

describe('Copy Link Row', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it('copies the profile URL when clicked', async () => {
    render(<AccountSettings {...defaultProps} />)
    fireEvent.click(screen.getByLabelText('Copy profile link'))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('/testuser')
      )
    })
  })
})

// ── Change Username Dialog ────────────────────────────────────────────────────

describe('Change Username', () => {
  function openDialog() {
    render(<AccountSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Change username'))
  }

  it('opens dialog with username field when row is clicked', async () => {
    openDialog()
    await waitFor(() => expect(screen.getByLabelText('New username')).toBeDefined())
  })

  it('calls profiles update with new username', async () => {
    mockUpdate.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('New username'))
    const input = screen.getByLabelText('New username')
    await user.clear(input)
    await user.type(input, 'newname')
    await user.click(screen.getByRole('button', { name: /save username/i }))
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith('user_id', 'u1'))
  })

  it('shows error toast when username is already taken', async () => {
    mockUpdate.mockResolvedValue({ error: { message: 'duplicate key', code: '23505' } })
    const { toast } = await import('sonner')
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('New username'))
    const input = screen.getByLabelText('New username')
    await user.clear(input)
    await user.type(input, 'takenname')
    await user.click(screen.getByRole('button', { name: /save username/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('That username is already taken'))
  })

  it('shows validation error for invalid username format', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('New username'))
    const input = screen.getByLabelText('New username')
    await user.clear(input)
    await user.type(input, 'INVALID USER')
    await user.click(screen.getByRole('button', { name: /save username/i }))
    await waitFor(() => expect(screen.getByText(/lowercase/i)).toBeDefined())
  })
})

// ── Change Password Dialog ────────────────────────────────────────────────────

describe('Change Password', () => {
  function openDialog() {
    render(<AccountSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Change password'))
  }

  it('opens dialog with password fields when row is clicked', async () => {
    openDialog()
    await waitFor(() => expect(screen.getByLabelText('Current password')).toBeDefined())
    expect(screen.getByLabelText('New password')).toBeDefined()
    expect(screen.getByLabelText('Confirm new password')).toBeDefined()
  })

  it('re-authenticates with current password before updating', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('Current password'))
    await user.type(screen.getByLabelText('Current password'), 'OldPass1')
    await user.type(screen.getByLabelText('New password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass1')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'OldPass1',
      })
    })
  })

  it('calls updateUser with new password after successful re-auth', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('Current password'))
    await user.type(screen.getByLabelText('Current password'), 'OldPass1')
    await user.type(screen.getByLabelText('New password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass1')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPass1' })
    })
  })

  it('shows error and does not update when current password is wrong', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: { message: 'Invalid' } })
    const { toast } = await import('sonner')
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('Current password'))
    await user.type(screen.getByLabelText('Current password'), 'Wrong1')
    await user.type(screen.getByLabelText('New password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass1')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Current password is incorrect'))
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('shows validation error when new password lacks uppercase', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('Current password'))
    await user.type(screen.getByLabelText('Current password'), 'OldPass1')
    await user.type(screen.getByLabelText('New password'), 'newpass1')
    await user.type(screen.getByLabelText('Confirm new password'), 'newpass1')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => expect(screen.getByText(/uppercase/i)).toBeDefined())
    expect(mockUpdateUser).not.toHaveBeenCalled()
  })

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('Current password'))
    await user.type(screen.getByLabelText('Current password'), 'OldPass1')
    await user.type(screen.getByLabelText('New password'), 'NewPass1')
    await user.type(screen.getByLabelText('Confirm new password'), 'NewPass2')
    await user.click(screen.getByRole('button', { name: /update password/i }))
    await waitFor(() => expect(screen.getByText(/do not match/i)).toBeDefined())
  })
})

// ── Change Email Dialog ───────────────────────────────────────────────────────

describe('Change Email', () => {
  function openDialog() {
    render(<AccountSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Change email'))
  }

  it('opens dialog with email field when row is clicked', async () => {
    openDialog()
    await waitFor(() => expect(screen.getByLabelText('New email address')).toBeDefined())
  })

  it('calls updateUser with new email', async () => {
    const user = userEvent.setup()
    openDialog()
    await waitFor(() => screen.getByLabelText('New email address'))
    await user.type(screen.getByLabelText('New email address'), 'new@example.com')
    await user.click(screen.getByRole('button', { name: /update email/i }))
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ email: 'new@example.com' })
    })
  })

  it('shows validation error for invalid email', async () => {
    openDialog()
    await waitFor(() => screen.getByLabelText('New email address'))
    fireEvent.input(screen.getByLabelText('New email address'), { target: { value: 'not-an-email' } })
    fireEvent.submit(screen.getByLabelText('New email address').closest('form')!)
    await waitFor(() => expect(screen.getByText(/valid email/i)).toBeDefined())
  })
})

// ── Delete Account Dialog ─────────────────────────────────────────────────────

describe('Delete Account', () => {
  function openDialog() {
    render(<AccountSettings {...defaultProps} />)
    fireEvent.click(screen.getByText('Delete account'))
  }

  it('opens dialog with confirmation input when row is clicked', async () => {
    openDialog()
    await waitFor(() => expect(screen.getByLabelText('Confirm account deletion')).toBeDefined())
  })

  it('delete button is disabled until confirmation phrase is typed', async () => {
    openDialog()
    await waitFor(() => screen.getByLabelText('Confirm account deletion'))
    const btn = screen.getByRole('button', { name: /delete account/i })
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('enables delete button when exact phrase is typed', async () => {
    openDialog()
    await waitFor(() => screen.getByLabelText('Confirm account deletion'))
    fireEvent.change(screen.getByLabelText('Confirm account deletion'), {
      target: { value: 'delete my account' },
    })
    expect((screen.getByRole('button', { name: /delete account/i }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('calls DELETE /api/account/delete on confirmation', async () => {
    openDialog()
    await waitFor(() => screen.getByLabelText('Confirm account deletion'))
    fireEvent.change(screen.getByLabelText('Confirm account deletion'), {
      target: { value: 'delete my account' },
    })
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }))
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/account/delete', { method: 'DELETE' })
    })
  })

  it('signs out and redirects to / after successful deletion', async () => {
    openDialog()
    await waitFor(() => screen.getByLabelText('Confirm account deletion'))
    fireEvent.change(screen.getByLabelText('Confirm account deletion'), {
      target: { value: 'delete my account' },
    })
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }))
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('shows error toast and does not redirect when deletion fails', async () => {
    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Deletion failed' }),
    } as unknown as Response)
    const { toast } = await import('sonner')
    openDialog()
    await waitFor(() => screen.getByLabelText('Confirm account deletion'))
    fireEvent.change(screen.getByLabelText('Confirm account deletion'), {
      target: { value: 'delete my account' },
    })
    fireEvent.click(screen.getByRole('button', { name: /delete account/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Deletion failed'))
    expect(mockPush).not.toHaveBeenCalled()
  })
})
