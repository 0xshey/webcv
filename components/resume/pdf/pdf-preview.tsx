'use client'

import { PDFViewer } from '@react-pdf/renderer'
import { ResumePDF } from './resume-pdf'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import type { PdfFont, BasicsFields } from './resume-pdf'

export function PdfPreview({
  content,
  structure,
  font,
  basicsFields,
}: {
  content: ResumeContent
  structure: ResumeStructure
  font: PdfFont
  basicsFields: BasicsFields
}) {
  return (
    <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
      <ResumePDF
        content={content}
        structure={structure}
        font={font}
        basicsFields={basicsFields}
      />
    </PDFViewer>
  )
}
