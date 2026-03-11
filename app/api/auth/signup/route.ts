import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { signupSchema } from '@/lib/validations/profile'
import { env } from '@/env'

export async function POST(request: Request) {
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

  // Create user (no email confirmation)
  const { data: userData, error: createError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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

  // Sign in to get session tokens
  const browserClient = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: signInData, error: signInError } =
    await browserClient.auth.signInWithPassword({ email, password })

  if (signInError || !signInData.session) {
    return NextResponse.json(
      { error: 'Account created but sign-in failed. Please log in.' },
      { status: 200 }
    )
  }

  return NextResponse.json({ session: signInData.session }, { status: 201 })
}
