import { VerifyEmailForm } from '@/components/auth/verify-email-form'

interface Props {
  searchParams: Promise<{ email?: string; username?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email = '', username = '' } = await searchParams
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold">Check your email</h1>
        <p className="mt-1 text-muted-foreground">
          We sent an 8-digit code to <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <VerifyEmailForm email={email} username={username} />
    </div>
  )
}
