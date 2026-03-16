'use client'

import { Plus } from 'lucide-react'
import { v4 as uuid } from 'uuid'
import { useResume } from '@/components/providers/resume-provider'
import type { SectionKey } from '@/lib/types'

const defaultItems: Record<Exclude<SectionKey, 'basics'>, Record<string, unknown>> = {
  work: { name: '', position: '', startDate: '', endDate: '', url: '', summary: '' },
  education: { institution: '', area: '', studyType: '', startDate: '', endDate: '', score: '' },
  skills: { name: '', level: '', keywords: '' },
  projects: { name: '', description: '', url: '', startDate: '', endDate: '' },
  volunteer: { organization: '', position: '', url: '', startDate: '', endDate: '', summary: '' },
  awards: { title: '', date: '', awarder: '', summary: '' },
  publications: { name: '', publisher: '', releaseDate: '', url: '', summary: '' },
  languages: { language: '', fluency: '' },
  interests: { name: '', keywords: '' },
  references: { name: '', reference: '' },
  certificates: { name: '', issuer: '', date: '', url: '' },
}

interface AddBlockButtonProps {
  section: Exclude<SectionKey, 'basics'>
}

export function AddBlockButton({ section }: AddBlockButtonProps) {
  const { dispatch } = useResume()

  const handleAdd = () => {
    const item = { id: uuid(), ...defaultItems[section] }
    dispatch({
      type: 'ADD_BLOCK',
      section,
      item: item as Parameters<typeof dispatch>[0] extends { item: infer I } ? I : never,
    })
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors pl-5 mt-1"
    >
      <Plus size={11} />
      Add
    </button>
  )
}
