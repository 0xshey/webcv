import { describe, it, expect, vi, beforeEach } from 'vitest'

// Must mock before importing the route
const mockMaybeSingle = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockAdminCreateUser = vi.hoisted(() => vi.fn())
const mockAdminDeleteUser = vi.hoisted(() => vi.fn())

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
  createServerClient: vi.fn(),
}))

import { POST } from '@/app/api/auth/signup/route'

// Each test group gets a unique IP to avoid rate-limit bleed between tests
let ipCounter = 0
function makeRequest(body: unknown, ip?: string) {
  return new Request('http://localhost/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip ?? `10.${Math.floor(ipCounter / 255)}.${ipCounter++ % 255}.1`,
    },
    body: JSON.stringify(body),
  })
}

const validBody = {
  email: 'user@example.com',
  password: 'Password1',
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
  })

  describe('rate limiting', () => {
    it('allows requests below the limit', async () => {
      const ip = '192.168.99.1'
      const res = await POST(makeRequest(validBody, ip))
      expect(res.status).not.toBe(429)
    })

    it('returns 429 after MAX_ATTEMPTS requests from the same IP', async () => {
      const ip = '192.168.99.2'
      // Exhaust the 5 allowed attempts
      for (let i = 0; i < 5; i++) {
        await POST(makeRequest(validBody, ip))
      }
      // 6th request should be blocked
      const res = await POST(makeRequest(validBody, ip))
      expect(res.status).toBe(429)
      const body = await res.json() as { error: string }
      expect(body.error).toMatch(/too many requests/i)
    })

    it('does not count attempts from different IPs against each other', async () => {
      const ip1 = '192.168.99.3'
      const ip2 = '192.168.99.4'
      // Exhaust ip1's limit
      for (let i = 0; i < 5; i++) {
        await POST(makeRequest(validBody, ip1))
      }
      // ip2 should still be allowed
      const res = await POST(makeRequest(validBody, ip2))
      expect(res.status).not.toBe(429)
    })

    it('reads IP from x-forwarded-for (first value if comma-separated)', async () => {
      const ip = '192.168.99.5'
      // Exhaust limit using the real IP (first in the header)
      for (let i = 0; i < 5; i++) {
        await POST(new Request('http://localhost/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': `${ip}, 10.0.0.1`,
          },
          body: JSON.stringify(validBody),
        }))
      }
      // 6th with same real IP
      const res = await POST(new Request('http://localhost/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': `${ip}, 10.0.0.2`,
        },
        body: JSON.stringify(validBody),
      }))
      expect(res.status).toBe(429)
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
      const res = await POST(makeRequest({ ...validBody, password: 'Pass1' }))
      expect(res.status).toBe(400)
    })

    it('returns 400 when password lacks uppercase letter', async () => {
      const res = await POST(makeRequest({ ...validBody, password: 'password1' }))
      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toMatch(/uppercase/i)
    })

    it('returns 400 when password lacks a number', async () => {
      const res = await POST(makeRequest({ ...validBody, password: 'Password' }))
      expect(res.status).toBe(400)
      const body = await res.json() as { error: string }
      expect(body.error).toMatch(/number/i)
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

  describe('successful signup', () => {
    it('returns 201 with status "verify" and email on success', async () => {
      const res = await POST(makeRequest(validBody))
      expect(res.status).toBe(201)
      const body = await res.json() as { status: string; email: string }
      expect(body.status).toBe('verify')
      expect(body.email).toBe(validBody.email)
    })

    it('creates user with email_confirm: false so OTP email is sent', async () => {
      await POST(makeRequest(validBody))
      expect(mockAdminCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({ email_confirm: false })
      )
    })
  })
})
