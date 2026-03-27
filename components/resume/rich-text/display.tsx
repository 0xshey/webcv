interface RichTextDisplayProps {
  html: string
  className?: string
}

export function RichTextDisplay({ html, className }: RichTextDisplayProps) {
  return (
    <div
      className={`[&_ul]:list-disc [&_ul]:pl-4 ${className ?? ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
