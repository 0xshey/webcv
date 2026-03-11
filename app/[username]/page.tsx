import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import { PublicResume } from '@/components/resume/public-resume'

export const revalidate = 60

interface PageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .single()

  if (!profile) return { title: 'Not Found' }

  const { data: resume } = await supabase
    .from('resumes')
    .select('content')
    .eq('user_id', profile.user_id)
    .single()

  const content = resume?.content as ResumeContent | undefined
  const name = content?.basics?.name ?? username
  const summary = content?.basics?.summary
    ? content.basics.summary.replace(/<[^>]+>/g, '').slice(0, 160)
    : undefined

  return {
    title: `${name} — Resume`,
    description: summary,
  }
}

export default async function PublicResumePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .single()

  if (!profile) notFound()

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', profile.user_id)
    .single()

  if (!resume) notFound()

  const content = resume.content as ResumeContent
  const structure = resume.structure as ResumeStructure

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PublicResume content={content} structure={structure} />
    </main>
  )
}
