import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations/profile'
import { env } from '@/env'

// ── In-memory rate limiter (sliding window per IP) ────────────────────────────
// Per-instance only — sufficient for Vercel (each instance is isolated).
// Swap the Map for Upstash Redis for stronger cross-instance protection.
const _attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = _attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    _attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_ATTEMPTS) return false
  entry.count++
  return true
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  const body: unknown = await request.json()
  const parsed = signupSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { email, password, username } = parsed.data

  const adminClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Check username uniqueness
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json(
      { error: 'Username is already taken' },
      { status: 409 }
    )
  }

  // Create user — email_confirm: false so Supabase sends the OTP verification email
  const { data: userData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

  if (createError || !userData.user) {
    return NextResponse.json(
      { error: createError?.message ?? 'Failed to create user' },
      { status: 400 }
    )
  }

  // Insert profile
  const { error: profileError } = await adminClient.from('profiles').insert({
    user_id: userData.user.id,
    username,
  })

  if (profileError) {
    // Cleanup user on profile insert failure
    await adminClient.auth.admin.deleteUser(userData.user.id)
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    )
  }

  // Return email so the client can redirect to the OTP verification page
  return NextResponse.json({ status: 'verify', email }, { status: 201 })
}
