'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download } from 'lucide-react'
import { useResume } from '@/components/providers/resume-provider'
import { Button } from '@/components/ui/button'
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
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={loading}
          title={loading ? 'Preparing PDF…' : 'Download PDF'}
          className="text-muted-foreground"
        >
          <Download size={13} />
        </Button>
      )}
    </PDFDownloadLink>
  )
}
