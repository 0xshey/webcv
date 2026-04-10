'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import { ResumePDF, type PdfFont, type BasicsFields } from './resume-pdf'
import { getResumeFilename } from '@/lib/pdf'

interface PdfLinkProps {
  content: ResumeContent
  structure: ResumeStructure
  font?: PdfFont
  basicsFields?: BasicsFields
  children: (state: { loading: boolean }) => ReactNode
}

export function PdfLink({ content, structure, font, basicsFields, children }: PdfLinkProps) {
  return (
    <PDFDownloadLink
      document={<ResumePDF content={content} structure={structure} font={font} basicsFields={basicsFields} />}
      fileName={getResumeFilename(content.basics.name)}
    >
      {({ loading }) => children({ loading })}
    </PDFDownloadLink>
  )
}
