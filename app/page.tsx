import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Resume Builder</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Create and share your resume in minutes
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    </main>
  )
}
