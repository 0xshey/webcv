import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/providers/auth-provider'

const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: vi.fn().mockResolvedValue({}),
    },
  }),
}))

function TestConsumer() {
  const { user, session, loading } = useAuth()
  if (loading) return <div>loading</div>
  if (!session) return <div>signed out</div>
  return <div>signed in as {user?.email}</div>
}

const fakeSession = {
  user: { id: 'u1', email: 'user@example.com' },
  access_token: 'tok',
}

beforeEach(() => {
  mockGetSession.mockResolvedValue({ data: { session: fakeSession } })
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('shows loading state initially then resolves session', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    expect(screen.getByText('loading')).toBeDefined()
    await waitFor(() => expect(screen.getByText(/signed in as/i)).toBeDefined())
  })

  it('exposes user email from session', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => expect(screen.getByText('signed in as user@example.com')).toBeDefined())
  })

  it('shows signed-out state when session is null', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } })
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => expect(screen.getByText('signed out')).toBeDefined())
  })

  it('adds a visibilitychange listener on mount', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => screen.getByText(/signed in/))
    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    addSpy.mockRestore()
  })

  it('removes the visibilitychange listener on unmount', async () => {
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => screen.getByText(/signed in/))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    removeSpy.mockRestore()
  })

  it('rechecks session when tab becomes visible', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => screen.getByText(/signed in/))

    // Simulate tab going hidden then visible
    mockGetSession.mockResolvedValue({ data: { session: null } })
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    await waitFor(() => expect(screen.getByText('signed out')).toBeDefined())
  })

  it('does not recheck session when tab becomes hidden', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => screen.getByText(/signed in/))

    const callsBefore = mockGetSession.mock.calls.length
    await act(async () => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(mockGetSession.mock.calls.length).toBe(callsBefore)
  })

  it('unsubscribes from onAuthStateChange on unmount', async () => {
    const unsubscribe = vi.fn()
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe } } })
    const { unmount } = render(<AuthProvider><TestConsumer /></AuthProvider>)
    await waitFor(() => screen.getByText(/signed in/))
    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})
