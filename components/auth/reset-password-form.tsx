'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type Values = z.infer<typeof schema>

type State = 'checking' | 'ready' | 'invalid'

export function ResetPasswordForm() {
  const router = useRouter()
  const [state, setState] = useState<State>('checking')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const supabase = createClient()
    // Supabase fires PASSWORD_RECOVERY when the user lands with the reset token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setState('ready')
      }
    })

    // Short timeout — if no PASSWORD_RECOVERY event fires, the link is invalid/expired
    const timer = setTimeout(() => {
      setState((s) => (s === 'checking' ? 'invalid' : s))
    }, 1500)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  const onSubmit = async (values: Values) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: values.password })
    if (error) {
      toast.error(error.message)
      setIsLoading(false)
      return
    }
    toast.success('Password updated. Please sign in.')
    router.push('/login')
  }

  if (state === 'checking') {
    return <p className="text-sm text-muted-foreground">Verifying link…</p>
  }

  if (state === 'invalid') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          This link is invalid or has expired.
        </p>
        <Link href="/forgot-password" className="text-sm underline">
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          {...register('confirm')}
        />
        {errors.confirm && (
          <p className="text-red-500 text-sm">{errors.confirm.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}
