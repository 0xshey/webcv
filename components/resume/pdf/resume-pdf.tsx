import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer'
import type { ResumeContent, ResumeStructure, SectionKey } from '@/lib/types'
import { formatDate } from '@/lib/resume'
import { stripHtml, parseLiItems } from '@/lib/html-utils'

const INK   = '#0a0a0a'
const MUTED = '#555555'

export type PdfFont = 'Helvetica' | 'Times-Roman' | 'Courier'

function getFontFamily(font: PdfFont) {
  if (font === 'Times-Roman') return { normal: 'Times-Roman', bold: 'Times-Bold',    italic: 'Times-Italic'    }
  if (font === 'Courier')     return { normal: 'Courier',     bold: 'Courier-Bold',  italic: 'Courier-Oblique' }
  return                             { normal: 'Helvetica',   bold: 'Helvetica-Bold', italic: 'Helvetica-Oblique' }
}

function makeStyles(font: PdfFont) {
  const f = getFontFamily(font)
  return StyleSheet.create({
    page: {
      fontFamily: f.normal,
      fontSize: 10,
      paddingTop: 38,
      paddingBottom: 38,
      paddingHorizontal: 48,
      color: INK,
      lineHeight: 1.35,
    },

    // ── Header ──────────────────────────────────────────────────
    header: { alignItems: 'center', marginBottom: 10 },
    name: {
      fontFamily: f.bold,
      fontSize: 20,
      letterSpacing: 2,
      marginBottom: 5,
    },
    contactLine: {
      flexDirection: 'row',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginBottom: 1,
    },
    contactItem: { fontSize: 9, color: MUTED },
    contactLink: { fontSize: 9, color: MUTED, textDecoration: 'none' },
    dot: { fontSize: 9, color: '#aaa', marginHorizontal: 4 },

    // ── Section title ────────────────────────────────────────────
    section: { marginTop: 10 },
    sectionTitle: {
      fontFamily: f.bold,
      fontSize: 11,
      letterSpacing: 0.6,
      paddingBottom: 2,
      marginBottom: 5,
      borderBottomWidth: 0.75,
      borderBottomColor: INK,
    },

    // ── Entry block ──────────────────────────────────────────────
    block: { marginBottom: 6 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    orgName:  { fontFamily: f.bold,   fontSize: 10 },
    roleText: { fontFamily: f.italic, fontSize: 9, color: MUTED, marginTop: 1 },
    dateText: { fontSize: 9, color: MUTED },

    // ── Body / bullets ───────────────────────────────────────────
    body: { fontSize: 9, lineHeight: 1.45, marginTop: 2 },
    bullet: { flexDirection: 'row', marginTop: 2 },
    bulletDot:  { width: 10, fontSize: 8, color: MUTED },
    bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4 },

    // ── Inline label+value (skills) ──────────────────────────────
    inlineRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 3 },
    inlineLabel: { fontFamily: f.bold, fontSize: 9 },
    inlineValue: { fontSize: 9 },
  })
}

// ── Utilities (re-exported for consumers that imported from here) ─────────────
export { stripHtml, parseLiItems } from '@/lib/html-utils'

function HtmlText({ html, s }: { html: string; s: ReturnType<typeof makeStyles> }) {
  const items = parseLiItems(html)
  if (items.length > 0) {
    return (
      <View>
        {items.map((item, i) => (
          <View key={i} style={s.bullet}>
            <Text style={s.bulletDot}>•</Text>
            <Text style={s.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    )
  }
  return <Text style={s.body}>{stripHtml(html)}</Text>
}

// Renders:  item  ·  item  ·  item  (centered)
function ContactLine({ items, s }: { items: (string | React.ReactElement)[]; s: ReturnType<typeof makeStyles> }) {
  const nonEmpty = items.filter(Boolean)
  if (nonEmpty.length === 0) return null
  return (
    <View style={s.contactLine}>
      {nonEmpty.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {i > 0 && <Text style={s.dot}>·</Text>}
          {typeof item === 'string'
            ? <Text style={s.contactItem}>{item}</Text>
            : item}
        </View>
      ))}
    </View>
  )
}

const SECTION_LABELS: Record<SectionKey, string> = {
  basics:       'Summary',
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

// ── Main component ───────────────────────────────────────────────────────────

export interface BasicsFields {
  summary: boolean
  email: boolean
  phone: boolean
  url: boolean
}

interface ResumePDFProps {
  content: ResumeContent
  structure: ResumeStructure
  font?: PdfFont
  basicsFields?: BasicsFields
}

export function ResumePDF({ content, structure, font = 'Times-Roman', basicsFields }: ResumePDFProps) {
  const { basics } = content
  const s = makeStyles(font)
  const bf: BasicsFields = { summary: true, email: true, phone: true, url: true, ...basicsFields }

  const dateRange = (start?: string, end?: string) =>
    [start ? formatDate(start) : null, end ? formatDate(end) : 'Present']
      .filter(Boolean).join(' – ')

  return (
    <Document>
      <Page size="LETTER" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.name}>{basics.name?.toUpperCase()}</Text>

          <ContactLine s={s} items={[
            (basics.phone && bf.phone)
              ? <Link key="phone" src={`tel:${basics.phone}`} style={s.contactLink}>{basics.phone}</Link>
              : '',
            (basics.email && bf.email)
              ? <Link key="email" src={`mailto:${basics.email}`} style={s.contactLink}>{basics.email}</Link>
              : '',
          ]} />

          {(basics.url && bf.url) && (
            <ContactLine s={s} items={[
              <Link key="url" src={basics.url} style={s.contactLink}>
                {basics.url.replace(/^https?:\/\//, '')}
              </Link>,
            ]} />
          )}
        </View>

        {/* Summary */}
        {(basics.summary && bf.summary) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>{'Summary'.toUpperCase()}</Text>
            <HtmlText s={s} html={basics.summary} />
          </View>
        )}

        {/* ── Sections ── */}
        {structure.sections
          .filter((sec) => sec.visible && sec.key !== 'basics')
          .map((sec) => {
            const key = sec.key as Exclude<SectionKey, 'basics'>
            const items = (content[key] as unknown[] | undefined) ?? []
            if (items.length === 0) return null

            return (
              <View key={sec.key} style={s.section}>
                <Text style={s.sectionTitle}>{SECTION_LABELS[sec.key].toUpperCase()}</Text>

                {/* Work */}
                {key === 'work' &&
                  (items as import('@/lib/types').ResumeWorkItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.name}</Text>
                        <Text style={s.dateText}>{dateRange(item.startDate, item.endDate)}</Text>
                      </View>
                      <Text style={s.roleText}>{item.position}</Text>
                      {item.summary && <HtmlText s={s} html={item.summary} />}
                    </View>
                  ))}

                {/* Education */}
                {key === 'education' &&
                  (items as import('@/lib/types').ResumeEducationItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.institution}</Text>
                        <Text style={s.dateText}>{dateRange(item.startDate, item.endDate)}</Text>
                      </View>
                      <Text style={s.roleText}>{item.studyType} in {item.area}</Text>
                      {item.score && <Text style={{ fontSize: 9, color: MUTED, marginTop: 1 }}>GPA: {item.score}</Text>}
                    </View>
                  ))}

                {/* Projects */}
                {key === 'projects' &&
                  (items as import('@/lib/types').ResumeProjectItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.name}</Text>
                        {(item.endDate ?? item.startDate) && (
                          <Text style={s.dateText}>{formatDate(item.endDate ?? item.startDate)}</Text>
                        )}
                      </View>
                      {item.description && <HtmlText s={s} html={item.description} />}
                    </View>
                  ))}

                {/* Skills — **Label:** value */}
                {key === 'skills' &&
                  (items as import('@/lib/types').ResumeSkillItem[]).map((item) => (
                    <View key={item.id} style={s.inlineRow}>
                      <Text style={s.inlineLabel}>{item.name}{item.keywords ? ': ' : ''}</Text>
                      {item.keywords && (
                        <Text style={s.inlineValue}>
                          {Array.isArray(item.keywords)
                            ? item.keywords.join(', ')
                            : item.keywords}
                        </Text>
                      )}
                      {item.level && !item.keywords && (
                        <Text style={s.inlineValue}>{item.level}</Text>
                      )}
                    </View>
                  ))}

                {/* Volunteer */}
                {key === 'volunteer' &&
                  (items as import('@/lib/types').ResumeVolunteerItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.organization}</Text>
                        <Text style={s.dateText}>{dateRange(item.startDate, item.endDate)}</Text>
                      </View>
                      <Text style={s.roleText}>{item.position}</Text>
                      {item.summary && <HtmlText s={s} html={item.summary} />}
                    </View>
                  ))}

                {/* Certificates */}
                {key === 'certificates' &&
                  (items as import('@/lib/types').ResumeCertificateItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.name}</Text>
                        {item.date && <Text style={s.dateText}>{formatDate(item.date)}</Text>}
                      </View>
                      <Text style={s.roleText}>{item.issuer}</Text>
                    </View>
                  ))}

                {/* Awards */}
                {key === 'awards' &&
                  (items as import('@/lib/types').ResumeAwardItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.title}</Text>
                        <Text style={s.dateText}>{formatDate(item.date)}</Text>
                      </View>
                      <Text style={s.roleText}>{item.awarder}</Text>
                      {item.summary && <Text style={s.body}>{item.summary}</Text>}
                    </View>
                  ))}

                {/* Languages */}
                {key === 'languages' &&
                  (items as import('@/lib/types').ResumeLanguageItem[]).map((item) => (
                    <View key={item.id} style={s.inlineRow}>
                      <Text style={s.inlineLabel}>{item.language}</Text>
                      {item.fluency && <Text style={s.inlineValue}> — {item.fluency}</Text>}
                    </View>
                  ))}

                {/* Publications */}
                {key === 'publications' &&
                  (items as import('@/lib/types').ResumePublicationItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <View style={s.row}>
                        <Text style={s.orgName}>{item.name}</Text>
                        <Text style={s.dateText}>{formatDate(item.releaseDate)}</Text>
                      </View>
                      <Text style={s.roleText}>{item.publisher}</Text>
                      {item.summary && <Text style={s.body}>{item.summary}</Text>}
                    </View>
                  ))}

                {/* Interests */}
                {key === 'interests' &&
                  (items as import('@/lib/types').ResumeInterestItem[]).map((item) => (
                    <View key={item.id} style={s.inlineRow}>
                      <Text style={s.inlineLabel}>{item.name}</Text>
                      {item.keywords && (
                        <Text style={s.inlineValue}>
                          {': '}{Array.isArray(item.keywords) ? item.keywords.join(', ') : item.keywords}
                        </Text>
                      )}
                    </View>
                  ))}

                {/* References */}
                {key === 'references' &&
                  (items as import('@/lib/types').ResumeReferenceItem[]).map((item) => (
                    <View key={item.id} style={s.block}>
                      <Text style={s.orgName}>{item.name}</Text>
                      <Text style={s.body}>{item.reference}</Text>
                    </View>
                  ))}

              </View>
            )
          })}
      </Page>
    </Document>
  )
}
