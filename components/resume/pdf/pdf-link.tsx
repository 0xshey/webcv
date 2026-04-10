'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import { ResumePDF, type PdfFont } from './resume-pdf'
import { getResumeFilename } from '@/lib/pdf'

interface PdfLinkProps {
  content: ResumeContent
  structure: ResumeStructure
  font?: PdfFont
  children: (state: { loading: boolean }) => ReactNode
}

export function PdfLink({ content, structure, font, children }: PdfLinkProps) {
  return (
    <PDFDownloadLink
      document={<ResumePDF content={content} structure={structure} font={font} />}
      fileName={getResumeFilename(content.basics.name)}
    >
      {({ loading }) => children({ loading })}
    </PDFDownloadLink>
  )
}
