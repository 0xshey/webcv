import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.hoisted(() => vi.fn())
const mockAdminDeleteUser = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      admin: { deleteUser: mockAdminDeleteUser },
    },
  }),
}))

import { DELETE } from '@/app/api/account/delete/route'

function makeRequest() {
  return new Request('http://localhost/api/account/delete', { method: 'DELETE' })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
  mockAdminDeleteUser.mockResolvedValue({ error: null })
})

describe('DELETE /api/account/delete', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Not authenticated' } })
    const res = await DELETE(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Unauthorized')
  })

  it('calls admin.deleteUser with the authenticated user id', async () => {
    await DELETE(makeRequest())
    expect(mockAdminDeleteUser).toHaveBeenCalledWith('u1')
  })

  it('returns 200 with ok:true on success', async () => {
    const res = await DELETE(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json() as { ok: boolean }
    expect(body.ok).toBe(true)
  })

  it('returns 500 with error message when deletion fails', async () => {
    mockAdminDeleteUser.mockResolvedValue({ error: { message: 'DB error' } })
    const res = await DELETE(makeRequest())
    expect(res.status).toBe(500)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('DB error')
  })
})
