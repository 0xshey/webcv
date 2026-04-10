'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import type { BasicsFields } from './resume-pdf'
import type { DocxFont } from '@/lib/docx-generator'
import { getResumeDocxFilename } from '@/lib/pdf'

interface DocxDownloadButtonProps {
  content: ResumeContent
  structure: ResumeStructure
  basicsFields: BasicsFields
  font: DocxFont
  className?: string
}

export function DocxDownloadButton({
  content,
  structure,
  basicsFields,
  font,
  className,
}: DocxDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const [{ generateResumeDocx }, { Packer }] = await Promise.all([
        import('@/lib/docx-generator'),
        import('docx'),
      ])
      const doc = generateResumeDocx(content, structure, basicsFields, font)
      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getResumeDocxFilename(content.basics.name)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button className={className} onClick={handleDownload} disabled={loading}>
      <Download size={13} />
      {loading ? 'Generating…' : 'Download DOCX'}
    </Button>
  )
}
