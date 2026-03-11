import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must mock before importing the route
const mockMaybeSingle = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockAdminCreateUser = vi.hoisted(() => vi.fn())
const mockAdminDeleteUser = vi.hoisted(() => vi.fn())
const mockSignIn = vi.hoisted(() => vi.fn())

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: mockMaybeSingle,
            }),
          }),
          insert: mockInsert,
        }
      }
      return {}
    }),
    auth: {
      admin: {
        createUser: mockAdminCreateUser,
        deleteUser: mockAdminDeleteUser,
      },
    },
  }),
}))

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn().mockReturnValue({
    auth: {
      signInWithPassword: mockSignIn,
    },
  }),
  createServerClient: vi.fn(),
}))

import { POST } from '@/app/api/auth/signup/route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validBody = {
  email: 'user@example.com',
  password: 'password123',
  username: 'johndoe',
}

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockAdminCreateUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    })
    mockInsert.mockResolvedValue({ error: null })
    mockSignIn.mockResolvedValue({
      data: { session: { access_token: 'access', refresh_token: 'refresh' } },
      error: null,
    })
  })

  describe('validation', () => {
    it('returns 400 when email is invalid', async () => {
      const res = await POST(makeRequest({ ...validBody, email: 'not-email' }))
      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toBeTruthy()
    })

    it('returns 400 when username contains invalid characters', async () => {
      const res = await POST(makeRequest({ ...validBody, username: 'John@Doe' }))
      expect(res.status).toBe(400)
    })

    it('returns 400 when password is too short', async () => {
      const res = await POST(makeRequest({ ...validBody, password: 'short' }))
      expect(res.status).toBe(400)
    })

    it('returns 400 when body is missing required fields', async () => {
      const res = await POST(makeRequest({}))
      expect(res.status).toBe(400)
    })
  })

  describe('username uniqueness', () => {
    it('returns 409 with "Username is already taken" when profiles query returns a match', async () => {
      mockMaybeSingle.mockResolvedValue({ data: { user_id: 'existing' }, error: null })
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(409)
      const body = await res.json() as { error: string }
      expect(body.error).toBe('Username is already taken')
    })
  })

  describe('user creation', () => {
    it('returns 400 with error.message when adminClient.auth.admin.createUser fails', async () => {
      mockAdminCreateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email already registered' },
      })
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toBe('Email already registered')
    })

    it('returns 400 when createUser returns no user', async () => {
      mockAdminCreateUser.mockResolvedValue({ data: { user: null }, error: null })
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(400)
    })
  })

  describe('profile insertion', () => {
    it('calls insert with user_id and username', async () => {
      await POST(makeRequest(validBody))
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'user-123',
        username: 'johndoe',
      })
    })

    it('deletes the created user when profile insert fails', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'Duplicate username' } })
      await POST(makeRequest(validBody))
      expect(mockAdminDeleteUser).toHaveBeenCalledWith('user-123')
    })

    it('returns 400 with profileError.message when profile insert fails', async () => {
      mockInsert.mockResolvedValue({ error: { message: 'Duplicate username' } })
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toBe('Duplicate username')
    })
  })

  describe('sign-in', () => {
    it('returns 200 with error message when sign-in fails after profile creation', async () => {
      mockSignIn.mockResolvedValue({ data: { session: null }, error: { message: 'Sign-in failed' } })
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(200)
      const body = await res.json() as { error: string }
      expect(body.error).toContain('sign-in failed')
    })

    it('returns 201 with session object on fully successful signup', async () => {
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(201)
      const body = await res.json() as { session: { access_token: string; refresh_token: string } }
      expect(body.session).toBeDefined()
    })

    it('the session in the response contains access_token and refresh_token', async () => {
      const res = await POST(makeRequest(validBody))
      const body = await res.json() as { session: { access_token: string; refresh_token: string } }
      expect(body.session.access_token).toBe('access')
      expect(body.session.refresh_token).toBe('refresh')
    })
  })
})
