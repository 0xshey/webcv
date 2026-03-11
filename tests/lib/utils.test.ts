import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('flex')).toBe('flex')
  })

  it('merges two class names', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('deduplicates conflicting tailwind classes — last wins', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles conditional classes — falsy values are dropped', () => {
    const condition = false
    expect(cn('flex', condition && 'text-red-500', 'items-center')).toBe('flex items-center')
  })

  it('handles undefined without throwing', () => {
    expect(() => cn(undefined, 'flex')).not.toThrow()
    expect(cn(undefined, 'flex')).toBe('flex')
  })

  it('handles null without throwing', () => {
    expect(() => cn(null, 'flex')).not.toThrow()
  })

  it('merges text color conflict — last wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('merges padding-x conflict — last wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
