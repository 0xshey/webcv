import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ResumeProvider } from '@/components/providers/resume-provider'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Resume } from '@/components/resume/resume'
import type { ResumeContent, ResumeStructure } from '@/lib/types'

const DEFAULT_CONTENT: ResumeContent = {
  basics: { name: '', email: '', summary: '' },
}

const DEFAULT_STRUCTURE: ResumeStructure = {
  sections: [
    { key: 'basics', visible: true },
    { key: 'work', visible: true },
    { key: 'education', visible: true },
    { key: 'skills', visible: true },
    { key: 'projects', visible: false },
    { key: 'volunteer', visible: false },
    { key: 'awards', visible: false },
    { key: 'certificates', visible: false },
    { key: 'publications', visible: false },
    { key: 'languages', visible: false },
    { key: 'interests', visible: false },
    { key: 'references', visible: false },
  ],
  layout: { columns: 1 },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, { data: resume }] = await Promise.all([
    supabase.from('profiles').select('username').eq('user_id', user.id).single(),
    supabase.from('resumes').select('*').eq('user_id', user.id).single(),
  ])

  if (!resume) notFound()

  const content = (resume.content as ResumeContent) ?? DEFAULT_CONTENT
  const structure = (resume.structure as ResumeStructure) ?? DEFAULT_STRUCTURE
  const username = profile?.username ?? ''

  return (
    <Suspense>
      <ResumeProvider
        initialContent={content}
        initialStructure={structure}
        resumeId={resume.id as string}
      >
        <DashboardShell username={username}>
          <div className="mx-auto max-w-3xl">
            <Resume />
          </div>
        </DashboardShell>
      </ResumeProvider>
    </Suspense>
  )
}
