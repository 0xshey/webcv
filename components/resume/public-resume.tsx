import type {
  ResumeContent,
  ResumeStructure,
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
import { RichTextDisplay } from './rich-text/display'
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
import { Separator } from '@/components/ui/separator'
import { LinkCapsule, EmailCapsule, PhoneCapsule } from './block/view'

const SECTION_LABELS: Record<SectionKey, string> = {
  basics: 'Summary',
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

interface PublicResumeProps {
  content: ResumeContent
  structure: ResumeStructure
}

export function PublicResume({ content, structure }: PublicResumeProps) {
  const { basics } = content

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">{basics.name}</h1>
        {basics.label && (
          <p className="text-base text-muted-foreground">{basics.label}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {basics.email && <EmailCapsule email={basics.email} />}
          {basics.phone && <PhoneCapsule phone={basics.phone} />}
          {basics.url && <LinkCapsule href={basics.url} />}
        </div>
        {basics.summary && (
          <div className="mt-4">
            <RichTextDisplay html={basics.summary} />
          </div>
        )}
      </div>

      {/* Sections */}
      {structure.sections
        .filter((s) => s.visible && s.key !== 'basics')
        .map((s) => {
          const sectionKey = s.key as Exclude<SectionKey, 'basics'>
          const items = (content[sectionKey] as unknown[] | undefined) ?? []
          if (items.length === 0) return null

          return (
            <div key={s.key} className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="font-medium text-muted-foreground">
                  {SECTION_LABELS[s.key]}
                </h2>
                <Separator className="flex-1" />
              </div>
              <div className="flex flex-col gap-5">
                {sectionKey === 'work' &&
                  (items as ResumeWorkItem[]).map((item) => (
                    <WorkBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'education' &&
                  (items as ResumeEducationItem[]).map((item) => (
                    <EducationBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'skills' &&
                  (items as ResumeSkillItem[]).map((item) => (
                    <SkillBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'projects' &&
                  (items as ResumeProjectItem[]).map((item) => (
                    <ProjectBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'volunteer' &&
                  (items as ResumeVolunteerItem[]).map((item) => (
                    <VolunteerBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'awards' &&
                  (items as ResumeAwardItem[]).map((item) => (
                    <AwardBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'publications' &&
                  (items as ResumePublicationItem[]).map((item) => (
                    <PublicationBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'languages' &&
                  (items as ResumeLanguageItem[]).map((item) => (
                    <LanguageBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'interests' &&
                  (items as ResumeInterestItem[]).map((item) => (
                    <InterestBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'references' &&
                  (items as ResumeReferenceItem[]).map((item) => (
                    <ReferenceBlock key={item.id} item={item} />
                  ))}
                {sectionKey === 'certificates' &&
                  (items as ResumeCertificateItem[]).map((item) => (
                    <CertificateBlock key={item.id} item={item} />
                  ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}
