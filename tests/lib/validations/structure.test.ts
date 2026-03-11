import { describe, it, expect } from 'vitest'
import { sectionKeySchema, resumeStructureSchema } from '@/lib/validations/structure'

const ALL_KEYS = [
  'basics', 'work', 'volunteer', 'education', 'awards', 'certificates',
  'publications', 'skills', 'languages', 'interests', 'references', 'projects',
]

describe('sectionKeySchema', () => {
  it('accepts all 12 valid section keys', () => {
    ALL_KEYS.forEach((key) => {
      expect(sectionKeySchema.safeParse(key).success, `key: ${key}`).toBe(true)
    })
  })

  it('rejects unknown key', () => {
    expect(sectionKeySchema.safeParse('hobbies').success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(sectionKeySchema.safeParse('').success).toBe(false)
  })
})

describe('resumeStructureSchema', () => {
  const validStructure = {
    sections: [{ key: 'basics', visible: true }],
    layout: { columns: 1 },
  }

  it('accepts valid structure with sections and layout columns: 1', () => {
    expect(resumeStructureSchema.safeParse(validStructure).success).toBe(true)
  })

  it('accepts layout columns: 2', () => {
    expect(resumeStructureSchema.safeParse({ ...validStructure, layout: { columns: 2 } }).success).toBe(true)
  })

  it('rejects layout columns: 3', () => {
    expect(resumeStructureSchema.safeParse({ ...validStructure, layout: { columns: 3 } }).success).toBe(false)
  })

  it('rejects layout columns: 0', () => {
    expect(resumeStructureSchema.safeParse({ ...validStructure, layout: { columns: 0 } }).success).toBe(false)
  })

  it('rejects section with invalid key', () => {
    expect(
      resumeStructureSchema.safeParse({
        sections: [{ key: 'invalid_key', visible: true }],
        layout: { columns: 1 },
      }).success
    ).toBe(false)
  })

  it('rejects section with missing visible field', () => {
    expect(
      resumeStructureSchema.safeParse({
        sections: [{ key: 'basics' }],
        layout: { columns: 1 },
      }).success
    ).toBe(false)
  })
})
