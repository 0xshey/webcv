'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { ExternalLink, LogOut, Pencil, Eye } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { useResume } from '@/components/providers/resume-provider'

const PDFDownloadButton = dynamic(
  () => import('@/components/resume/pdf/pdf-download-button').then((m) => m.PDFDownloadButton),
  { ssr: false, loading: () => null }
)

export function DashboardShell({
  username,
  children,
}: {
  username: string
  children: ReactNode
}) {
  const { signOut } = useAuth()
  const { isSaving, isDirty, isEditMode, toggleEditMode } = useResume()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <>
      <header className="flex h-12 items-center justify-between border-b border-[var(--border)] px-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">Resume Builder</span>
          {username && (
            <Link
              href={`/${username}`}
              target="_blank"
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <span>/{username}</span>
              <ExternalLink size={10} />
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--muted-foreground)]">
            {isSaving ? 'Saving…' : isDirty ? 'Unsaved' : 'Saved'}
          </span>
          <Button variant="ghost" size="sm" onClick={toggleEditMode} className="gap-1">
            {isEditMode ? <Eye size={14} /> : <Pencil size={14} />}
            {isEditMode ? 'Preview' : 'Edit'}
          </Button>
          <PDFDownloadButton />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut size={14} />
          </Button>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </>
  )
}
