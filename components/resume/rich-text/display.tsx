interface RichTextDisplayProps {
  html: string
  className?: string
}

export function RichTextDisplay({ html, className }: RichTextDisplayProps) {
  return (
    <div
      className={`prose max-w-none ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
