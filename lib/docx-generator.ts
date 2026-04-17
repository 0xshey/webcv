import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  TabStopType,
  type ISectionOptions,
  type IParagraphOptions,
} from 'docx'
import type { ResumeContent, ResumeStructure, SectionKey } from '@/lib/types'
import type { BasicsFields } from '@/components/resume/pdf/resume-pdf'
import { formatDate } from '@/lib/resume'
import { parseLiItems, stripHtml } from '@/lib/html-utils'

export type DocxFont = 'Calibri' | 'Arial' | 'Georgia' | 'Tahoma'

function normalizeKeywords(keywords?: string[] | string, fallback = ''): string {
  if (Array.isArray(keywords)) return keywords.join(', ')
  if (typeof keywords === 'string') return keywords
  return fallback
}

// ── Twip constants (1 inch = 1440 twips) ─────────────────────────────────────
const RIGHT_EDGE = 9208 // ~6.4 in — right tab stop for dates
const BODY_SIZE  = 22  // 11pt in half-points
const HEAD_SIZE  = 24  // 12pt
const NAME_SIZE  = 32  // 16pt

// ── Paragraph builders ────────────────────────────────────────────────────────

function nameP(text: string, font: DocxFont): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: NAME_SIZE, font })],
  })
}

function contactP(items: string[], font: DocxFont): Paragraph {
  const runs: TextRun[] = []
  items.filter(Boolean).forEach((item, i) => {
    if (i > 0) runs.push(new TextRun({ text: '  |  ', size: BODY_SIZE, font, color: '555555' }))
    runs.push(new TextRun({ text: item, size: BODY_SIZE, font }))
  })
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 240 },
    children: runs,
  })
}

function sectionHeading(title: string, font: DocxFont): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: title.toUpperCase(), bold: true, size: HEAD_SIZE, font })],
  })
}

/** Bold left label + tab + right-aligned date */
function entryHeaderP(left: string, right: string, font: DocxFont): Paragraph {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_EDGE }],
    spacing: { after: 0 },
    children: [
      new TextRun({ text: left, bold: true, size: BODY_SIZE, font }),
      new TextRun({ text: '\t' }),
      new TextRun({ text: right, size: BODY_SIZE, font, color: '555555' }),
    ],
  })
}

function subtitleP(text: string, font: DocxFont): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text, italics: true, size: BODY_SIZE, font, color: '555555' })],
  })
}

function plainP(text: string, font: DocxFont, options: Partial<IParagraphOptions> = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 40 },
    ...options,
    children: [new TextRun({ text, size: BODY_SIZE, font })],
  })
}

function inlineP(label: string, value: string, font: DocxFont): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, size: BODY_SIZE, font }),
      new TextRun({ text: value, size: BODY_SIZE, font }),
    ],
  })
}

function spacer(): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, children: [] })
}

/** Parse Tiptap HTML → Word native bullet paragraphs or plain fallback */
function htmlParagraphs(html: string | undefined, font: DocxFont): Paragraph[] {
  if (!html) return []
  const items = parseLiItems(html)
  if (items.length > 0) {
    return items.map((item) =>
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 40 },
        children: [new TextRun({ text: item, size: BODY_SIZE, font })],
      })
    )
  }
  const text = stripHtml(html)
  if (!text) return []
  return text.split('\n').filter(Boolean).map((line) => plainP(line, font))
}

function dateRange(start?: string, end?: string): string {
  const s = start ? formatDate(start) : ''
  const e = end ? formatDate(end) : 'Present'
  return s ? `${s} – ${e}` : e
}

// ── Section renderers ─────────────────────────────────────────────────────────

type ParaList = Paragraph[]

function renderWork(items: import('@/lib/types').ResumeWorkItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.name, dateRange(item.startDate, item.endDate), font))
    if (item.position) out.push(subtitleP(item.position, font))
    out.push(...htmlParagraphs(item.summary, font))
    out.push(spacer())
  }
  return out
}

function renderEducation(items: import('@/lib/types').ResumeEducationItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.institution, dateRange(item.startDate, item.endDate), font))
    out.push(subtitleP(`${item.studyType} in ${item.area}`, font))
    if (item.score) out.push(plainP(`GPA: ${item.score}`, font))
    out.push(spacer())
  }
  return out
}

function renderProjects(items: import('@/lib/types').ResumeProjectItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    const date = item.endDate ?? item.startDate
    out.push(entryHeaderP(item.name, date ? formatDate(date) : '', font))
    out.push(...htmlParagraphs(item.description, font))
    out.push(spacer())
  }
  return out
}

function renderSkills(items: import('@/lib/types').ResumeSkillItem[], font: DocxFont): ParaList {
  return items.map((item) => inlineP(item.name, normalizeKeywords(item.keywords, item.level ?? ''), font))
}

function renderVolunteer(items: import('@/lib/types').ResumeVolunteerItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.organization, dateRange(item.startDate, item.endDate), font))
    if (item.position) out.push(subtitleP(item.position, font))
    out.push(...htmlParagraphs(item.summary, font))
    out.push(spacer())
  }
  return out
}

function renderCertificates(items: import('@/lib/types').ResumeCertificateItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.name, item.date ? formatDate(item.date) : '', font))
    out.push(subtitleP(item.issuer, font))
    out.push(spacer())
  }
  return out
}

function renderAwards(items: import('@/lib/types').ResumeAwardItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.title, formatDate(item.date), font))
    out.push(subtitleP(item.awarder, font))
    if (item.summary) out.push(plainP(item.summary, font))
    out.push(spacer())
  }
  return out
}

function renderLanguages(items: import('@/lib/types').ResumeLanguageItem[], font: DocxFont): ParaList {
  return items.map((item) =>
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({ text: item.language, bold: true, size: BODY_SIZE, font }),
        new TextRun({ text: item.fluency ? ` — ${item.fluency}` : '', size: BODY_SIZE, font }),
      ],
    })
  )
}

function renderPublications(items: import('@/lib/types').ResumePublicationItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(entryHeaderP(item.name, formatDate(item.releaseDate), font))
    out.push(subtitleP(item.publisher, font))
    if (item.summary) out.push(plainP(item.summary, font))
    out.push(spacer())
  }
  return out
}

function renderInterests(items: import('@/lib/types').ResumeInterestItem[], font: DocxFont): ParaList {
  return items.map((item) => {
    const kw = normalizeKeywords(item.keywords)
    return kw ? inlineP(item.name, kw, font) : plainP(item.name, font)
  })
}

function renderReferences(items: import('@/lib/types').ResumeReferenceItem[], font: DocxFont): ParaList {
  const out: ParaList = []
  for (const item of items) {
    out.push(plainP(item.name, font, { children: [new TextRun({ text: item.name, bold: true, size: BODY_SIZE, font })] }))
    if (item.reference) out.push(plainP(item.reference, font))
    out.push(spacer())
  }
  return out
}

const SECTION_LABELS: Record<Exclude<SectionKey, 'basics'>, string> = {
  work:         'Employment History',
  education:    'Education',
  skills:       'Technical Strengths',
  projects:     'Projects',
  volunteer:    'Volunteer',
  awards:       'Awards',
  publications: 'Publications',
  languages:    'Languages',
  interests:    'Interests',
  references:   'References',
  certificates: 'Certificates',
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateResumeDocx(
  content: ResumeContent,
  structure: ResumeStructure,
  basicsFields: BasicsFields,
  font: DocxFont,
): Document {
  const { basics } = content
  const paragraphs: Paragraph[] = []

  // ── Header ──
  paragraphs.push(nameP(basics.name || 'Resume', font))

  const contactItems: string[] = []
  if (basics.phone && basicsFields.phone)   contactItems.push(basics.phone)
  if (basics.email && basicsFields.email)   contactItems.push(basics.email)
  if (basics.url   && basicsFields.url)     contactItems.push(basics.url.replace(/^https?:\/\//, ''))
  if (contactItems.length > 0) paragraphs.push(contactP(contactItems, font))

  // ── Summary ──
  if (basics.summary && basicsFields.summary) {
    paragraphs.push(sectionHeading('Summary', font))
    paragraphs.push(...htmlParagraphs(basics.summary, font))
    paragraphs.push(spacer())
  }

  // ── Sections ──
  for (const sec of structure.sections) {
    if (!sec.visible || sec.key === 'basics') continue
    const key = sec.key as Exclude<SectionKey, 'basics'>
    const items = (content[key] as unknown[] | undefined) ?? []
    if (items.length === 0) continue

    paragraphs.push(sectionHeading(SECTION_LABELS[key], font))

    switch (key) {
      case 'work':         paragraphs.push(...renderWork(items         as import('@/lib/types').ResumeWorkItem[],        font)); break
      case 'education':    paragraphs.push(...renderEducation(items    as import('@/lib/types').ResumeEducationItem[],   font)); break
      case 'projects':     paragraphs.push(...renderProjects(items     as import('@/lib/types').ResumeProjectItem[],     font)); break
      case 'skills':       paragraphs.push(...renderSkills(items       as import('@/lib/types').ResumeSkillItem[],       font)); break
      case 'volunteer':    paragraphs.push(...renderVolunteer(items    as import('@/lib/types').ResumeVolunteerItem[],   font)); break
      case 'certificates': paragraphs.push(...renderCertificates(items as import('@/lib/types').ResumeCertificateItem[], font)); break
      case 'awards':       paragraphs.push(...renderAwards(items       as import('@/lib/types').ResumeAwardItem[],       font)); break
      case 'languages':    paragraphs.push(...renderLanguages(items    as import('@/lib/types').ResumeLanguageItem[],    font)); break
      case 'publications': paragraphs.push(...renderPublications(items as import('@/lib/types').ResumePublicationItem[], font)); break
      case 'interests':    paragraphs.push(...renderInterests(items    as import('@/lib/types').ResumeInterestItem[],    font)); break
      case 'references':   paragraphs.push(...renderReferences(items   as import('@/lib/types').ResumeReferenceItem[],   font)); break
    }
  }

  const section: ISectionOptions = {
    properties: {
      page: {
        margin: { top: 720, bottom: 720, left: 1080, right: 1080 },
      },
    },
    children: paragraphs,
  }

  return new Document({
    styles: {
      default: {
        document: {
          run: { font, size: BODY_SIZE },
        },
      },
    },
    sections: [section],
  })
}
