import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  formatDate,
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
} from '@/components/resume/block'

describe('formatDate (block helper)', () => {
  it('returns "Present" for undefined', () => {
    expect(formatDate(undefined)).toBe('Present')
  })

  it('formats YYYY-MM correctly', () => {
    const result = formatDate('2023-06')
    expect(result).toMatch(/Jun 2023/)
  })

  it('formats YYYY-MM-DD correctly', () => {
    const result = formatDate('2023-01-15')
    expect(result).toMatch(/Jan 2023/)
  })
})

describe('WorkBlock', () => {
  const base = { id: 'w1', name: 'Acme Corp', position: 'Engineer', startDate: '2020-01' }

  it('renders position and company name', () => {
    render(<WorkBlock item={base} />)
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
  })

  it('renders a link when url is provided', () => {
    render(<WorkBlock item={{ ...base, url: 'https://acme.com' }} />)
    expect(screen.getByRole('link', { name: 'Acme Corp' })).toBeInTheDocument()
  })

  it('does NOT render a link when url is absent', () => {
    render(<WorkBlock item={base} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders date range', () => {
    render(<WorkBlock item={{ ...base, startDate: '2020-01', endDate: '2023-06' }} />)
    expect(screen.getByText(/Jan 2020/)).toBeInTheDocument()
    expect(screen.getByText(/Jun 2023/)).toBeInTheDocument()
  })

  it('does NOT render summary when absent', () => {
    render(<WorkBlock item={base} />)
    // No prose div with summary content
    expect(screen.queryByText(/Description/)).not.toBeInTheDocument()
  })
})

describe('EducationBlock', () => {
  const base = { id: 'e1', institution: 'MIT', area: 'Computer Science', studyType: 'Bachelor', startDate: '2015-09' }

  it('renders studyType and area as heading', () => {
    render(<EducationBlock item={base} />)
    expect(screen.getByText(/Bachelor in Computer Science/)).toBeInTheDocument()
  })

  it('renders institution', () => {
    render(<EducationBlock item={base} />)
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('renders score as GPA when present', () => {
    render(<EducationBlock item={{ ...base, score: '3.9' }} />)
    expect(screen.getByText(/GPA: 3.9/)).toBeInTheDocument()
  })

  it('does NOT render GPA when score is absent', () => {
    render(<EducationBlock item={base} />)
    expect(screen.queryByText(/GPA/)).not.toBeInTheDocument()
  })
})

describe('SkillBlock', () => {
  it('renders skill name', () => {
    render(<SkillBlock item={{ id: 's1', name: 'TypeScript' }} />)
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders level when present', () => {
    render(<SkillBlock item={{ id: 's1', name: 'TypeScript', level: 'Expert' }} />)
    expect(screen.getByText(/Expert/)).toBeInTheDocument()
  })

  it('renders keywords as comma-separated string when keywords is an array', () => {
    render(<SkillBlock item={{ id: 's1', name: 'JS', keywords: ['React', 'Node'] }} />)
    expect(screen.getByText('React, Node')).toBeInTheDocument()
  })

  it('renders keywords by splitting comma-separated string', () => {
    // @ts-expect-error — testing string keywords (as stored from form input)
    render(<SkillBlock item={{ id: 's1', name: 'JS', keywords: 'React, Node' }} />)
    expect(screen.getByText('React, Node')).toBeInTheDocument()
  })
})

describe('ProjectBlock', () => {
  it('renders project name as link when url provided', () => {
    render(<ProjectBlock item={{ id: 'p1', name: 'My App', url: 'https://myapp.com' }} />)
    expect(screen.getByRole('link', { name: 'My App' })).toBeInTheDocument()
  })

  it('renders project name as plain text when no url', () => {
    render(<ProjectBlock item={{ id: 'p1', name: 'My App' }} />)
    expect(screen.getByText('My App')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('VolunteerBlock', () => {
  it('renders position and organization', () => {
    render(<VolunteerBlock item={{ id: 'v1', organization: 'Red Cross', position: 'Volunteer', startDate: '2019-01' }} />)
    expect(screen.getByText('Volunteer')).toBeInTheDocument()
    expect(screen.getByText('Red Cross')).toBeInTheDocument()
  })
})

describe('AwardBlock', () => {
  it('renders title, awarder, and formatted date', () => {
    render(<AwardBlock item={{ id: 'a1', title: 'Best Engineer', date: '2022-11', awarder: 'Company' }} />)
    expect(screen.getByText('Best Engineer')).toBeInTheDocument()
    expect(screen.getByText('Company')).toBeInTheDocument()
    expect(screen.getByText(/Nov 2022/)).toBeInTheDocument()
  })

  it('renders summary when present', () => {
    render(<AwardBlock item={{ id: 'a1', title: 'Award', date: '2022-01', awarder: 'Org', summary: 'Great achievement' }} />)
    expect(screen.getByText('Great achievement')).toBeInTheDocument()
  })
})

describe('PublicationBlock', () => {
  it('renders name and publisher', () => {
    render(<PublicationBlock item={{ id: 'pub1', name: 'My Paper', publisher: 'Nature', releaseDate: '2021-03' }} />)
    expect(screen.getByText('My Paper')).toBeInTheDocument()
    expect(screen.getByText('Nature')).toBeInTheDocument()
  })

  it('renders as link when url present', () => {
    render(<PublicationBlock item={{ id: 'pub1', name: 'My Paper', publisher: 'Nature', releaseDate: '2021-03', url: 'https://nature.com/paper' }} />)
    expect(screen.getByRole('link', { name: 'My Paper' })).toBeInTheDocument()
  })
})

describe('LanguageBlock', () => {
  it('renders language and fluency', () => {
    render(<LanguageBlock item={{ id: 'l1', language: 'Spanish', fluency: 'Fluent' }} />)
    expect(screen.getByText('Spanish')).toBeInTheDocument()
    expect(screen.getByText(/Fluent/)).toBeInTheDocument()
  })
})

describe('InterestBlock', () => {
  it('renders name', () => {
    render(<InterestBlock item={{ id: 'i1', name: 'Hiking' }} />)
    expect(screen.getByText('Hiking')).toBeInTheDocument()
  })

  it('renders keywords when provided as array', () => {
    render(<InterestBlock item={{ id: 'i1', name: 'Hiking', keywords: ['Mountains', 'Trails'] }} />)
    expect(screen.getByText('Mountains, Trails')).toBeInTheDocument()
  })
})

describe('ReferenceBlock', () => {
  it('renders name and reference text', () => {
    render(<ReferenceBlock item={{ id: 'r1', name: 'John Smith', reference: 'Excellent colleague' }} />)
    expect(screen.getByText('John Smith')).toBeInTheDocument()
    expect(screen.getByText('Excellent colleague')).toBeInTheDocument()
  })
})

describe('CertificateBlock', () => {
  it('renders name and issuer', () => {
    render(<CertificateBlock item={{ id: 'c1', name: 'AWS Certified', issuer: 'Amazon' }} />)
    expect(screen.getByText('AWS Certified')).toBeInTheDocument()
    expect(screen.getByText('Amazon')).toBeInTheDocument()
  })

  it('renders date when present', () => {
    render(<CertificateBlock item={{ id: 'c1', name: 'AWS Certified', issuer: 'Amazon', date: '2023-05' }} />)
    expect(screen.getByText(/May 2023/)).toBeInTheDocument()
  })

  it('does NOT render date element when absent', () => {
    render(<CertificateBlock item={{ id: 'c1', name: 'AWS Certified', issuer: 'Amazon' }} />)
    expect(screen.queryByText(/2023/)).not.toBeInTheDocument()
  })

  it('renders as link when url present', () => {
    render(<CertificateBlock item={{ id: 'c1', name: 'AWS Certified', issuer: 'Amazon', url: 'https://aws.com' }} />)
    expect(screen.getByRole('link', { name: 'AWS Certified' })).toBeInTheDocument()
  })
})
