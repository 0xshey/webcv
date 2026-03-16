'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useResume } from '@/components/providers/resume-provider'
import type { SectionKey } from '@/lib/types'

const SECTION_LABELS: Record<SectionKey, string> = {
  basics: 'Basics',
  work: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  volunteer: 'Volunteer',
  awards: 'Awards',
  publications: 'Publications',
  languages: 'Languages',
  interests: 'Interests',
  references: 'References',
  certificates: 'Certificates',
}

interface SectionHeaderProps {
  sectionKey: SectionKey
  visible: boolean
}

export function SectionHeader({ sectionKey, visible }: SectionHeaderProps) {
  const { dispatch, isEditMode } = useResume()

  return (
    <div className="flex items-center gap-2">
      <h2 className="font-medium text-muted-foreground">
        {SECTION_LABELS[sectionKey]}
      </h2>
      <Separator className="flex-1" />
      {isEditMode && sectionKey !== 'basics' && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground"
          onClick={() => dispatch({ type: 'TOGGLE_SECTION', key: sectionKey })}
          title={visible ? 'Hide section' : 'Show section'}
        >
          {visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </Button>
      )}
    </div>
  )
}
