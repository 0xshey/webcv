import type { ResumeContent, ResumeStructure, SectionKey } from '@/lib/types'
import { RichTextDisplay } from './rich-text/display'
import { BLOCK_COMPONENTS, LinkCapsule, EmailCapsule, PhoneCapsule } from './block/view'
import { Separator } from '@/components/ui/separator'

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
                {items.map((item) => {
                  const BlockComponent = BLOCK_COMPONENTS[sectionKey]
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  return <BlockComponent key={(item as any).id} item={item as any} />
                })}
              </div>
            </div>
          )
        })}
    </div>
  )
}
