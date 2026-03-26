'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { ResumeContent, ResumeStructure } from '@/lib/types'
import { ResumePDF } from './resume-pdf'
import { getResumeFilename } from '@/lib/pdf'

interface PdfLinkProps {
  content: ResumeContent
  structure: ResumeStructure
  children: (state: { loading: boolean }) => ReactNode
}

export function PdfLink({ content, structure, children }: PdfLinkProps) {
  return (
    <PDFDownloadLink
      document={<ResumePDF content={content} structure={structure} />}
      fileName={getResumeFilename(content.basics.name)}
    >
      {({ loading }) => children({ loading })}
    </PDFDownloadLink>
  )
}
