'use client'

import { useResume } from '@/components/providers/resume-provider'
import { SectionHeader } from './section/header'
import { BasicsEditor } from './basics/editor'
import { SortableSection } from './section/sortable'
import {
  WorkBlock,
  EducationBlock,
  SkillBlock,
  ProjectBlock,
  VolunteerBlock,
  AwardBlock,
  PublicationBlock,
  LanguageBlock,
  InterestBlock,
  ReferenceBlock,
  CertificateBlock,
} from './block/view'
import { RichTextDisplay } from './rich-text/display'
import type {
  SectionKey,
  ResumeWorkItem,
  ResumeEducationItem,
  ResumeSkillItem,
  ResumeProjectItem,
  ResumeVolunteerItem,
  ResumeAwardItem,
  ResumePublicationItem,
  ResumeLanguageItem,
  ResumeInterestItem,
  ResumeReferenceItem,
  ResumeCertificateItem,
} from '@/lib/types'

function BasicsView() {
  const { content } = useResume()
  const { basics } = content
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-semibold">{basics.name || 'Your Name'}</h1>
      {basics.label && <p className="text-muted-foreground">{basics.label}</p>}
      <div className="flex flex-wrap gap-3 text-muted-foreground">
        {basics.email && <span>{basics.email}</span>}
        {basics.phone && <span>{basics.phone}</span>}
        {basics.url && (
          <a href={basics.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {basics.url.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>
      {basics.summary && (
        <div className="mt-2">
          <RichTextDisplay html={basics.summary} />
        </div>
      )}
    </div>
  )
}

function SectionContent({ sectionKey }: { sectionKey: Exclude<SectionKey, 'basics'> }) {
  const { content, isEditMode } = useResume()

  type BlockItem = { id: string } & Record<string, unknown>
  const items = ((content[sectionKey] as BlockItem[] | undefined) ?? []) as BlockItem[]

  if (isEditMode) {
    return <SortableSection section={sectionKey} items={items} />
  }

  if (items.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {sectionKey === 'work' &&
        (items as unknown as ResumeWorkItem[]).map((item) => (
          <WorkBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'education' &&
        (items as unknown as ResumeEducationItem[]).map((item) => (
          <EducationBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'skills' &&
        (items as unknown as ResumeSkillItem[]).map((item) => (
          <SkillBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'projects' &&
        (items as unknown as ResumeProjectItem[]).map((item) => (
          <ProjectBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'volunteer' &&
        (items as unknown as ResumeVolunteerItem[]).map((item) => (
          <VolunteerBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'awards' &&
        (items as unknown as ResumeAwardItem[]).map((item) => (
          <AwardBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'publications' &&
        (items as unknown as ResumePublicationItem[]).map((item) => (
          <PublicationBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'languages' &&
        (items as unknown as ResumeLanguageItem[]).map((item) => (
          <LanguageBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'interests' &&
        (items as unknown as ResumeInterestItem[]).map((item) => (
          <InterestBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'references' &&
        (items as unknown as ResumeReferenceItem[]).map((item) => (
          <ReferenceBlock key={item.id} item={item} />
        ))}
      {sectionKey === 'certificates' &&
        (items as unknown as ResumeCertificateItem[]).map((item) => (
          <CertificateBlock key={item.id} item={item} />
        ))}
    </div>
  )
}

export function Resume() {
  const { content, structure, isEditMode } = useResume()

  const orderedSections = structure.sections

  return (
    <div className="flex flex-col gap-6">
      {/* Basics — always first */}
      <div className="flex flex-col gap-3">
        <SectionHeader sectionKey="basics" visible />
        {isEditMode ? <BasicsEditor /> : <BasicsView />}
      </div>

      {/* Other sections in structure order */}
      {orderedSections
        .filter((s) => s.key !== 'basics')
        .map((s) => {
          const sectionKey = s.key as Exclude<SectionKey, 'basics'>
          const items = (content[sectionKey] as unknown[] | undefined) ?? []

          // In view mode, skip invisible or empty sections
          if (!isEditMode && (!s.visible || items.length === 0)) return null

          return (
            <div key={s.key} className={`flex flex-col gap-3 ${!s.visible && isEditMode ? 'opacity-40' : ''}`}>
              <SectionHeader sectionKey={s.key} visible={s.visible} />
              <SectionContent sectionKey={sectionKey} />
            </div>
          )
        })}
    </div>
  )
}
