'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const OTP_LENGTH = 8
const RESEND_COOLDOWN = 60 // seconds

interface Props {
  email: string
  username: string
}

export function VerifyEmailForm({ email, username }: Props) {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code.`)
      return
    }
    setError('')
    setIsVerifying(true)
    const supabase = createClient()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })
    if (verifyError) {
      setError(verifyError.message)
      setIsVerifying(false)
      return
    }
    toast.success('Email verified! Welcome.')
    router.push(`/${username}`)
    router.refresh()
  }

  const handleResend = async () => {
    setIsResending(true)
    const supabase = createClient()
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    setIsResending(false)
    if (resendError) {
      toast.error(resendError.message)
    } else {
      toast.success('Code resent — check your inbox.')
      setCooldown(RESEND_COOLDOWN)
    }
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="otp">Verification code</Label>
        <Input
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          placeholder={'0'.repeat(OTP_LENGTH)}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <Button type="submit" disabled={isVerifying || code.length !== OTP_LENGTH}>
        {isVerifying ? 'Verifying…' : 'Verify email'}
      </Button>

      <div className="text-center">
        {cooldown > 0 ? (
          <p className="text-xs text-muted-foreground">Resend available in {cooldown}s</p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isResending ? 'Sending…' : 'Resend code'}
          </button>
        )}
      </div>
    </form>
  )
}
