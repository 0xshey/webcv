'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { signupSchema, type SignupFormValues } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    const data = await res.json() as Record<string, unknown>

    if (!res.ok) {
      const errorMsg = typeof data?.error === 'string' ? data.error : 'Something went wrong'
      toast.error(errorMsg)
      setIsLoading(false)
      return
    }

    // Redirect to OTP verification page
    router.push(
      `/verify-email?email=${encodeURIComponent(values.email)}&username=${encodeURIComponent(values.username)}`
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="e.g. john_doe"
          {...register('username')}
        />
        {errors.username && (
          <p className="text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && (
          <p className="text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="text-red-500">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  )
}
