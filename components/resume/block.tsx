import type {
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
import { RichTextDisplay } from './rich-text-display'

export function formatDate(d: string | undefined) {
  if (!d) return 'Present'
  // Support both YYYY-MM-DD and YYYY-MM
  const parts = d.split('-')
  const year = parts[0] ?? ''
  const month = parts[1]
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function DateRange({ start, end }: { start?: string; end?: string }) {
  if (!start && !end) return null
  return (
    <span className="text-sm text-[var(--muted-foreground)]">
      {formatDate(start)} – {end ? formatDate(end) : 'Present'}
    </span>
  )
}

export function WorkBlock({ item }: { item: ResumeWorkItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{item.position}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.name}
              </a>
            ) : (
              item.name
            )}
          </p>
        </div>
        <DateRange start={item.startDate} end={item.endDate} />
      </div>
      {item.summary && (
        <RichTextDisplay html={item.summary} className="text-sm" />
      )}
    </div>
  )
}

export function EducationBlock({ item }: { item: ResumeEducationItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{item.studyType} in {item.area}</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.institution}
              </a>
            ) : (
              item.institution
            )}
          </p>
        </div>
        <DateRange start={item.startDate} end={item.endDate} />
      </div>
      {item.score && (
        <p className="text-sm text-[var(--muted-foreground)]">GPA: {item.score}</p>
      )}
    </div>
  )
}

export function SkillBlock({ item }: { item: ResumeSkillItem }) {
  const keywords = Array.isArray(item.keywords)
    ? item.keywords
    : typeof item.keywords === 'string' && item.keywords
    ? (item.keywords as string).split(',').map((k) => k.trim()).filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-medium">{item.name}</span>
        {item.level && (
          <span className="text-sm text-[var(--muted-foreground)]">· {item.level}</span>
        )}
      </div>
      {keywords.length > 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">{keywords.join(', ')}</p>
      )}
    </div>
  )
}

export function ProjectBlock({ item }: { item: ResumeProjectItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </p>
        {(item.startDate ?? item.endDate) && (
          <DateRange start={item.startDate} end={item.endDate} />
        )}
      </div>
      {item.description && (
        <RichTextDisplay html={item.description} className="text-sm" />
      )}
    </div>
  )
}

export function VolunteerBlock({ item }: { item: ResumeVolunteerItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{item.position}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{item.organization}</p>
        </div>
        <DateRange start={item.startDate} end={item.endDate} />
      </div>
      {item.summary && (
        <RichTextDisplay html={item.summary} className="text-sm" />
      )}
    </div>
  )
}

export function AwardBlock({ item }: { item: ResumeAwardItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{item.title}</p>
        <span className="text-sm text-[var(--muted-foreground)]">{formatDate(item.date)}</span>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{item.awarder}</p>
      {item.summary && <p className="text-sm">{item.summary}</p>}
    </div>
  )
}

export function PublicationBlock({ item }: { item: ResumePublicationItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </p>
        <span className="text-sm text-[var(--muted-foreground)]">{formatDate(item.releaseDate)}</span>
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{item.publisher}</p>
      {item.summary && <p className="text-sm">{item.summary}</p>}
    </div>
  )
}

export function LanguageBlock({ item }: { item: ResumeLanguageItem }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{item.language}</span>
      <span className="text-sm text-[var(--muted-foreground)]">· {item.fluency}</span>
    </div>
  )
}

export function InterestBlock({ item }: { item: ResumeInterestItem }) {
  const keywords = Array.isArray(item.keywords)
    ? item.keywords
    : typeof item.keywords === 'string' && item.keywords
    ? (item.keywords as string).split(',').map((k) => k.trim()).filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-medium">{item.name}</span>
      {keywords.length > 0 && (
        <p className="text-sm text-[var(--muted-foreground)]">{keywords.join(', ')}</p>
      )}
    </div>
  )
}

export function ReferenceBlock({ item }: { item: ResumeReferenceItem }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="font-medium">{item.name}</p>
      <p className="text-sm">{item.reference}</p>
    </div>
  )
}

export function CertificateBlock({ item }: { item: ResumeCertificateItem }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {item.name}
            </a>
          ) : (
            item.name
          )}
        </p>
        {item.date && <span className="text-sm text-[var(--muted-foreground)]">{formatDate(item.date)}</span>}
      </div>
      <p className="text-sm text-[var(--muted-foreground)]">{item.issuer}</p>
    </div>
  )
}
