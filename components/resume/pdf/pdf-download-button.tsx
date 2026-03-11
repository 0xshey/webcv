'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResume } from '@/components/providers/resume-provider'
import { ResumePDF } from './resume-pdf'

export function PDFDownloadButton() {
  const { content, structure } = useResume()
  const filename = `${content.basics.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`

  return (
    <PDFDownloadLink
      document={<ResumePDF content={content} structure={structure} />}
      fileName={filename}
    >
      {({ loading }) => (
        <Button variant="outline" size="sm" disabled={loading} className="gap-2">
          <Download size={14} />
          {loading ? 'Preparing…' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
