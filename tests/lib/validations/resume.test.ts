import { describe, it, expect } from 'vitest'
import {
  basicsSchema,
  workItemSchema,
  educationItemSchema,
  skillItemSchema,
  projectItemSchema,
  volunteerItemSchema,
  awardItemSchema,
  publicationItemSchema,
  languageItemSchema,
  interestItemSchema,
  referenceItemSchema,
  certificateItemSchema,
} from '@/lib/validations/resume'

describe('basicsSchema', () => {
  it('accepts minimum valid object — name + email', () => {
    expect(basicsSchema.safeParse({ name: 'Jane', email: 'jane@example.com' }).success).toBe(true)
  })
  it('rejects missing name', () => {
    expect(basicsSchema.safeParse({ email: 'jane@example.com' }).success).toBe(false)
  })
  it('rejects invalid email', () => {
    expect(basicsSchema.safeParse({ name: 'Jane', email: 'not-email' }).success).toBe(false)
  })
  it('rejects invalid url — plain string with no protocol', () => {
    expect(basicsSchema.safeParse({ name: 'Jane', email: 'j@e.com', url: 'example.com' }).success).toBe(false)
  })
  it('accepts empty string for url', () => {
    expect(basicsSchema.safeParse({ name: 'Jane', email: 'j@e.com', url: '' }).success).toBe(true)
  })
  it('accepts valid https url', () => {
    expect(basicsSchema.safeParse({ name: 'Jane', email: 'j@e.com', url: 'https://example.com' }).success).toBe(true)
  })
})

describe('workItemSchema', () => {
  const valid = { name: 'Acme', position: 'Engineer' }
  it('accepts valid item with all fields', () => {
    expect(workItemSchema.safeParse({ ...valid, startDate: '2020-01', endDate: '2023-06', url: 'https://acme.com' }).success).toBe(true)
  })
  it('rejects missing name', () => {
    expect(workItemSchema.safeParse({ position: 'Engineer' }).success).toBe(false)
  })
  it('rejects missing position', () => {
    expect(workItemSchema.safeParse({ name: 'Acme' }).success).toBe(false)
  })
  it('accepts empty string for url', () => {
    expect(workItemSchema.safeParse({ ...valid, url: '' }).success).toBe(true)
  })
  it('accepts date in YYYY-MM format', () => {
    expect(workItemSchema.safeParse({ ...valid, startDate: '2020-01' }).success).toBe(true)
  })
  it('accepts date in YYYY-MM-DD format', () => {
    expect(workItemSchema.safeParse({ ...valid, startDate: '2020-01-15' }).success).toBe(true)
  })
  it('rejects date in YYYY/MM/DD format', () => {
    expect(workItemSchema.safeParse({ ...valid, startDate: '2020/01/15' }).success).toBe(false)
  })
  it('accepts empty string for dates', () => {
    expect(workItemSchema.safeParse({ ...valid, startDate: '', endDate: '' }).success).toBe(true)
  })
})

describe('educationItemSchema', () => {
  const valid = { institution: 'MIT', area: 'CS', studyType: 'Bachelor' }
  it('rejects missing institution', () => {
    expect(educationItemSchema.safeParse({ area: 'CS', studyType: 'Bachelor' }).success).toBe(false)
  })
  it('rejects missing area', () => {
    expect(educationItemSchema.safeParse({ institution: 'MIT', studyType: 'Bachelor' }).success).toBe(false)
  })
  it('rejects missing studyType', () => {
    expect(educationItemSchema.safeParse({ institution: 'MIT', area: 'CS' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(educationItemSchema.safeParse(valid).success).toBe(true)
  })
})

describe('skillItemSchema', () => {
  it('rejects missing name', () => {
    expect(skillItemSchema.safeParse({ level: 'Expert' }).success).toBe(false)
  })
  it('accepts item with only name', () => {
    expect(skillItemSchema.safeParse({ name: 'TypeScript' }).success).toBe(true)
  })
})

describe('projectItemSchema', () => {
  it('rejects missing name', () => {
    expect(projectItemSchema.safeParse({ description: 'A project' }).success).toBe(false)
  })
  it('accepts item with only name', () => {
    expect(projectItemSchema.safeParse({ name: 'My Project' }).success).toBe(true)
  })
})

describe('volunteerItemSchema', () => {
  it('rejects missing organization', () => {
    expect(volunteerItemSchema.safeParse({ position: 'Volunteer' }).success).toBe(false)
  })
  it('rejects missing position', () => {
    expect(volunteerItemSchema.safeParse({ organization: 'Red Cross' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(volunteerItemSchema.safeParse({ organization: 'Red Cross', position: 'Volunteer' }).success).toBe(true)
  })
})

describe('awardItemSchema', () => {
  it('rejects missing title', () => {
    expect(awardItemSchema.safeParse({ awarder: 'Company' }).success).toBe(false)
  })
  it('rejects missing awarder', () => {
    expect(awardItemSchema.safeParse({ title: 'Best Award' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(awardItemSchema.safeParse({ title: 'Best Award', awarder: 'Company' }).success).toBe(true)
  })
})

describe('publicationItemSchema', () => {
  it('rejects missing name', () => {
    expect(publicationItemSchema.safeParse({ publisher: 'Press' }).success).toBe(false)
  })
  it('rejects missing publisher', () => {
    expect(publicationItemSchema.safeParse({ name: 'My Paper' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(publicationItemSchema.safeParse({ name: 'My Paper', publisher: 'Press' }).success).toBe(true)
  })
})

describe('languageItemSchema', () => {
  it('rejects missing language', () => {
    expect(languageItemSchema.safeParse({ fluency: 'Native' }).success).toBe(false)
  })
  it('rejects missing fluency', () => {
    expect(languageItemSchema.safeParse({ language: 'English' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(languageItemSchema.safeParse({ language: 'English', fluency: 'Native speaker' }).success).toBe(true)
  })
})

describe('interestItemSchema', () => {
  it('rejects missing name', () => {
    expect(interestItemSchema.safeParse({ keywords: 'hiking' }).success).toBe(false)
  })
  it('accepts valid item with only name', () => {
    expect(interestItemSchema.safeParse({ name: 'Hiking' }).success).toBe(true)
  })
})

describe('referenceItemSchema', () => {
  it('rejects missing name', () => {
    expect(referenceItemSchema.safeParse({ reference: 'Great employee' }).success).toBe(false)
  })
  it('rejects missing reference text', () => {
    expect(referenceItemSchema.safeParse({ name: 'John Smith' }).success).toBe(false)
  })
  it('accepts valid item', () => {
    expect(referenceItemSchema.safeParse({ name: 'John Smith', reference: 'Great employee' }).success).toBe(true)
  })
})

describe('certificateItemSchema', () => {
  it('rejects missing name', () => {
    expect(certificateItemSchema.safeParse({ issuer: 'AWS' }).success).toBe(false)
  })
  it('rejects missing issuer', () => {
    expect(certificateItemSchema.safeParse({ name: 'AWS Certified' }).success).toBe(false)
  })
  it('accepts item without date and url', () => {
    expect(certificateItemSchema.safeParse({ name: 'AWS Certified', issuer: 'AWS' }).success).toBe(true)
  })
  it('accepts item with date and url', () => {
    expect(
      certificateItemSchema.safeParse({
        name: 'AWS Certified',
        issuer: 'AWS',
        date: '2023-06',
        url: 'https://aws.com/cert',
      }).success
    ).toBe(true)
  })
})
