import { describe, it, expect } from 'vitest'
import { signupSchema, loginSchema } from '@/lib/validations/profile'

describe('signupSchema', () => {
  it('accepts valid email, password ≥8 with uppercase and number, valid username', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'john_doe',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = signupSchema.safeParse({
      email: 'not-an-email',
      password: 'Password1',
      username: 'john_doe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password shorter than 8 characters', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Pass1',
      username: 'john_doe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects password without an uppercase letter', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'password1',
      username: 'john_doe',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('uppercase'))).toBe(true)
    }
  })

  it('rejects password without a number', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password',
      username: 'john_doe',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes('number'))).toBe(true)
    }
  })

  it('accepts password with uppercase and number, no symbol required', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Abcdefg1',
      username: 'john_doe',
    })
    expect(result.success).toBe(true)
  })

  it('rejects username shorter than 3 characters', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'ab',
    })
    expect(result.success).toBe(false)
  })

  it('rejects username longer than 30 characters', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'a'.repeat(31),
    })
    expect(result.success).toBe(false)
  })

  it('rejects username with uppercase letters', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'JohnDoe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects username with spaces', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'john doe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects username with special chars other than _ and -', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'john@doe',
    })
    expect(result.success).toBe(false)
  })

  it('accepts username with underscores and hyphens', () => {
    const result = signupSchema.safeParse({
      email: 'user@example.com',
      password: 'Password1',
      username: 'john-doe_123',
    })
    expect(result.success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('accepts valid email and non-empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'bad-email',
      password: 'anypassword',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    })
    expect(result.success).toBe(false)
  })
})
