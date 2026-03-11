import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer'
import type { ResumeContent, ResumeStructure, SectionKey } from '@/lib/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 48,
    color: '#171717',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 9,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#6b7280',
    marginBottom: 4,
    marginTop: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 2,
  },
  blockContainer: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  muted: {
    color: '#6b7280',
    fontSize: 9,
  },
  body: {
    fontSize: 9,
    lineHeight: 1.5,
    marginTop: 2,
  },
  bullet: {
    flexDirection: 'row',
    marginTop: 1,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    color: '#6b7280',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
})

export function formatDate(d: string | undefined) {
  if (!d) return 'Present'
  const parts = d.split('-')
  const year = parts[0] ?? ''
  const month = parts[1]
  if (!month) return year
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function parseLiItems(html: string): string[] {
  const matches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) ?? []
  return matches.map((m) =>
    m.replace(/<li[^>]*>/i, '').replace(/<\/li>/i, '').replace(/<[^>]+>/g, '').trim()
  )
}

function HtmlText({ html }: { html: string }) {
  const liItems = parseLiItems(html)
  if (liItems.length > 0) {
    return (
      <View>
        {liItems.map((item, i) => (
          <View key={i} style={styles.bullet}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{item}</Text>
          </View>
        ))}
      </View>
    )
  }
  const text = stripHtml(html)
  return <Text style={styles.body}>{text}</Text>
}

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

interface ResumePDFProps {
  content: ResumeContent
  structure: ResumeStructure
}

export function ResumePDF({ content, structure }: ResumePDFProps) {
  const { basics } = content

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{basics.name}</Text>
        {basics.label && <Text style={styles.label}>{basics.label}</Text>}
        <View style={styles.contactRow}>
          {basics.email && <Text style={styles.contactText}>{basics.email}</Text>}
          {basics.phone && <Text style={styles.contactText}>{basics.phone}</Text>}
          {basics.url && (
            <Link src={basics.url} style={styles.contactText}>
              {basics.url.replace(/^https?:\/\//, '')}
            </Link>
          )}
        </View>
        {basics.summary && <HtmlText html={basics.summary} />}

        {/* Sections */}
        {structure.sections
          .filter((s) => s.visible && s.key !== 'basics')
          .map((s) => {
            const sectionKey = s.key as Exclude<SectionKey, 'basics'>
            const items = (content[sectionKey] as unknown[] | undefined) ?? []
            if (items.length === 0) return null

            return (
              <View key={s.key}>
                <Text style={styles.sectionTitle}>{SECTION_LABELS[s.key]}</Text>

                {sectionKey === 'work' &&
                  (items as import('@/lib/types').ResumeWorkItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.position}</Text>
                        <Text style={styles.muted}>
                          {formatDate(item.startDate)} – {item.endDate ? formatDate(item.endDate) : 'Present'}
                        </Text>
                      </View>
                      <Text style={styles.muted}>{item.name}</Text>
                      {item.summary && <HtmlText html={item.summary} />}
                    </View>
                  ))}

                {sectionKey === 'education' &&
                  (items as import('@/lib/types').ResumeEducationItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.studyType} in {item.area}</Text>
                        <Text style={styles.muted}>
                          {formatDate(item.startDate)} – {item.endDate ? formatDate(item.endDate) : 'Present'}
                        </Text>
                      </View>
                      <Text style={styles.muted}>{item.institution}</Text>
                      {item.score && <Text style={styles.muted}>GPA: {item.score}</Text>}
                    </View>
                  ))}

                {sectionKey === 'skills' &&
                  (items as import('@/lib/types').ResumeSkillItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.name}</Text>
                        {item.level && <Text style={styles.muted}>{item.level}</Text>}
                      </View>
                      {item.keywords && (
                        <Text style={styles.muted}>
                          {Array.isArray(item.keywords)
                            ? item.keywords.join(', ')
                            : item.keywords}
                        </Text>
                      )}
                    </View>
                  ))}

                {sectionKey === 'projects' &&
                  (items as import('@/lib/types').ResumeProjectItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.name}</Text>
                        {(item.startDate ?? item.endDate) && (
                          <Text style={styles.muted}>
                            {formatDate(item.startDate)} – {item.endDate ? formatDate(item.endDate) : 'Present'}
                          </Text>
                        )}
                      </View>
                      {item.description && <HtmlText html={item.description} />}
                    </View>
                  ))}

                {sectionKey === 'languages' &&
                  (items as import('@/lib/types').ResumeLanguageItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.language}</Text>
                        <Text style={styles.muted}>{item.fluency}</Text>
                      </View>
                    </View>
                  ))}

                {sectionKey === 'certificates' &&
                  (items as import('@/lib/types').ResumeCertificateItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.name}</Text>
                        {item.date && <Text style={styles.muted}>{formatDate(item.date)}</Text>}
                      </View>
                      <Text style={styles.muted}>{item.issuer}</Text>
                    </View>
                  ))}

                {sectionKey === 'awards' &&
                  (items as import('@/lib/types').ResumeAwardItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.title}</Text>
                        <Text style={styles.muted}>{formatDate(item.date)}</Text>
                      </View>
                      <Text style={styles.muted}>{item.awarder}</Text>
                      {item.summary && <Text style={styles.body}>{item.summary}</Text>}
                    </View>
                  ))}

                {sectionKey === 'volunteer' &&
                  (items as import('@/lib/types').ResumeVolunteerItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.position}</Text>
                        <Text style={styles.muted}>
                          {formatDate(item.startDate)} – {item.endDate ? formatDate(item.endDate) : 'Present'}
                        </Text>
                      </View>
                      <Text style={styles.muted}>{item.organization}</Text>
                      {item.summary && <HtmlText html={item.summary} />}
                    </View>
                  ))}

                {sectionKey === 'publications' &&
                  (items as import('@/lib/types').ResumePublicationItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <View style={styles.row}>
                        <Text style={styles.bold}>{item.name}</Text>
                        <Text style={styles.muted}>{formatDate(item.releaseDate)}</Text>
                      </View>
                      <Text style={styles.muted}>{item.publisher}</Text>
                      {item.summary && <Text style={styles.body}>{item.summary}</Text>}
                    </View>
                  ))}

                {sectionKey === 'interests' &&
                  (items as import('@/lib/types').ResumeInterestItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <Text style={styles.bold}>{item.name}</Text>
                      {item.keywords && (
                        <Text style={styles.muted}>
                          {Array.isArray(item.keywords)
                            ? item.keywords.join(', ')
                            : item.keywords}
                        </Text>
                      )}
                    </View>
                  ))}

                {sectionKey === 'references' &&
                  (items as import('@/lib/types').ResumeReferenceItem[]).map((item) => (
                    <View key={item.id} style={styles.blockContainer}>
                      <Text style={styles.bold}>{item.name}</Text>
                      <Text style={styles.body}>{item.reference}</Text>
                    </View>
                  ))}
              </View>
            )
          })}
      </Page>
    </Document>
  )
}
