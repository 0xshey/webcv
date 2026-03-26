import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: unknown }) => children,
  Page: ({ children }: { children: unknown }) => children,
  Text: ({ children }: { children: unknown }) => children,
  View: ({ children }: { children: unknown }) => children,
  StyleSheet: { create: (s: unknown) => s },
  Link: ({ children }: { children: unknown }) => children,
}))

import { formatDate } from '@/lib/resume'
import { stripHtml, parseLiItems } from '@/components/resume/pdf/resume-pdf'

describe('formatDate (pdf helpers)', () => {
  it('returns "Present" for undefined', () => {
    expect(formatDate(undefined)).toBe('Present')
  })

  it('returns "Present" for empty string', () => {
    expect(formatDate('')).toBe('Present')
  })

  it('formats YYYY-MM to "Mon YYYY"', () => {
    // Month is locale-dependent but we can check format
    const result = formatDate('2023-06')
    expect(result).toMatch(/Jun 2023/)
  })

  it('formats YYYY-MM-DD — day is ignored, returns "Mon YYYY"', () => {
    const result = formatDate('2023-06-15')
    expect(result).toMatch(/Jun 2023/)
  })

  it('returns just year string when no month', () => {
    expect(formatDate('2023')).toBe('2023')
  })
})

describe('stripHtml', () => {
  it('removes simple tags', () => {
    expect(stripHtml('<p>Hello</p>')).toBe('Hello')
  })

  it('converts <br> to newline', () => {
    expect(stripHtml('line1<br>line2')).toBe('line1\nline2')
  })

  it('converts </p> to newline', () => {
    expect(stripHtml('<p>Hello</p><p>World</p>')).toBe('Hello\nWorld')
  })

  it('converts <li> prefix to bullet character', () => {
    const result = stripHtml('<li>Item</li>')
    expect(result).toContain('•')
    expect(result).toContain('Item')
  })

  it('decodes &amp;', () => {
    expect(stripHtml('A &amp; B')).toBe('A & B')
  })

  it('decodes &lt; and &gt;', () => {
    expect(stripHtml('&lt;tag&gt;')).toBe('<tag>')
  })

  it('decodes &nbsp;', () => {
    expect(stripHtml('Hello&nbsp;World')).toBe('Hello World')
  })

  it('collapses 3+ consecutive newlines to 2', () => {
    const result = stripHtml('<p>A</p><p>B</p><p>C</p>')
    expect(result).not.toMatch(/\n{3,}/)
  })

  it('trims whitespace from result', () => {
    expect(stripHtml('  <p>text</p>  ')).toBe('text')
  })

  it('handles empty string', () => {
    expect(stripHtml('')).toBe('')
  })
})

describe('parseLiItems', () => {
  it('returns empty array for string with no <li> tags', () => {
    expect(parseLiItems('<p>No items</p>')).toEqual([])
  })

  it('extracts single li text', () => {
    const result = parseLiItems('<ul><li>Item one</li></ul>')
    expect(result).toEqual(['Item one'])
  })

  it('extracts multiple li texts', () => {
    const result = parseLiItems('<ul><li>First</li><li>Second</li><li>Third</li></ul>')
    expect(result).toEqual(['First', 'Second', 'Third'])
  })

  it('strips inner HTML tags from li content', () => {
    const result = parseLiItems('<ul><li><strong>Bold item</strong></li></ul>')
    expect(result[0]).toBe('Bold item')
  })

  it('trims whitespace from each item', () => {
    const result = parseLiItems('<ul><li>  spaced  </li></ul>')
    expect(result[0]).toBe('spaced')
  })
})
