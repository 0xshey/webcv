import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RichTextDisplay } from '@/components/resume/rich-text/display'

describe('RichTextDisplay', () => {
  it('renders the container div', () => {
    const { container } = render(<RichTextDisplay html="<p>Hello</p>" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('sets innerHTML to the provided html prop', () => {
    const { container } = render(<RichTextDisplay html="<p>Hello World</p>" />)
    expect(container.innerHTML).toContain('Hello World')
  })

  it('applies the prose classes by default', () => {
    const { container } = render(<RichTextDisplay html="<p>text</p>" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('prose')
  })

  it('appends additional className when provided', () => {
    const { container } = render(<RichTextDisplay html="<p>text</p>" className="text-sm" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('text-sm')
  })

  it('renders empty string html without error', () => {
    expect(() => render(<RichTextDisplay html="" />)).not.toThrow()
  })

  it('renders html with bold tags — the inner text is present', () => {
    const { container } = render(<RichTextDisplay html="<p><strong>Bold text</strong></p>" />)
    expect(container.querySelector('strong')).toBeInTheDocument()
    expect(container.querySelector('strong')?.textContent).toBe('Bold text')
  })
})
