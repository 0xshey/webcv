'use client'

import { useState, useRef, useMemo } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, Eye, EyeOff, Download, FileText } from 'lucide-react'
import dynamic from 'next/dynamic'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { ResumeContent, ResumeStructure, SectionKey } from '@/lib/types'
import type { PdfFont, BasicsFields } from './resume-pdf'
import type { DocxFont } from '@/lib/docx-generator'
import { DocxDownloadButton } from './docx-download-button'

const PdfLink = dynamic(() => import('./pdf-link').then((m) => m.PdfLink), {
  ssr: false,
  loading: () => null,
})

const PdfPreview = dynamic(() => import('./pdf-preview').then((m) => m.PdfPreview), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      Loading preview…
    </div>
  ),
})

const SECTION_LABELS: Record<Exclude<SectionKey, 'basics'>, string> = {
  work:         'Employment History',
  education:    'Education',
  skills:       'Technical Strengths',
  projects:     'Projects',
  volunteer:    'Volunteer',
  awards:       'Awards',
  publications: 'Publications',
  languages:    'Languages',
  interests:    'Interests',
  references:   'References',
  certificates: 'Certificates',
}

const PDF_FONTS: { id: PdfFont; label: string; description: string; style: string }[] = [
  { id: 'Times-Roman', label: 'Serif',    description: 'Default',   style: '"Times New Roman", Times, serif'   },
  { id: 'Helvetica',   label: 'Sans',     description: 'Clean',     style: 'Helvetica, Arial, sans-serif'      },
  { id: 'Courier',     label: 'Courier',  description: 'Monospace', style: '"Courier New", Courier, monospace' },
]

const DOCX_FONTS: { id: DocxFont; label: string; description: string; style: string }[] = [
  { id: 'Calibri',  label: 'Calibri',  description: 'Modern',   style: 'Calibri, sans-serif'                   },
  { id: 'Arial',    label: 'Arial',    description: 'Clean',    style: 'Arial, sans-serif'                      },
  { id: 'Georgia',  label: 'Georgia',  description: 'Serif',    style: 'Georgia, serif'                         },
  { id: 'Tahoma',   label: 'Tahoma',   description: 'Compact',  style: 'Tahoma, sans-serif'                     },
]

interface PdfSection {
  key: Exclude<SectionKey, 'basics'>
  visible: boolean
}

function ToggleRow({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) {
  return (
    <div className={`flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/40 transition-opacity ${!visible ? 'opacity-40' : ''}`}>
      <span className="flex-1 text-sm">{label}</span>
      <button type="button" onClick={onToggle} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        {visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </div>
  )
}

function SectionRow({ section, onToggle }: { section: PdfSection; onToggle: () => void }) {
  const dragControls = useDragControls()
  const didDragRef = useRef(false)
  return (
    <Reorder.Item
      as="div"
      value={section}
      dragControls={dragControls}
      dragListener={false}
      whileDrag={{ scale: 1.01, opacity: 0.9, zIndex: 50 }}
      transition={{ duration: 0.12 }}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/40 select-none transition-opacity ${!section.visible ? 'opacity-40' : ''}`}
    >
      <button
        type="button"
        tabIndex={-1}
        onPointerDown={(e) => { didDragRef.current = false; dragControls.start(e) }}
        onPointerMove={() => { didDragRef.current = true }}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors flex-shrink-0"
      >
        <GripVertical size={13} />
      </button>
      <span className="flex-1 text-sm">{SECTION_LABELS[section.key]}</span>
      <button type="button" onClick={onToggle} className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0">
        {section.visible ? <Eye size={13} /> : <EyeOff size={13} />}
      </button>
    </Reorder.Item>
  )
}

interface PdfSettingsDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  content: ResumeContent
  structure: ResumeStructure
}

export function PdfSettingsDialog({ open, onOpenChange, content, structure }: PdfSettingsDialogProps) {
  const { basics } = content

  const [format, setFormat] = useState<'docx' | 'pdf'>('docx')
  const [pdfFont, setPdfFont] = useState<PdfFont>('Times-Roman')
  const [docxFont, setDocxFont] = useState<DocxFont>('Calibri')
  const [basicsFields, setBasicsFields] = useState<BasicsFields>({ summary: true, email: true, phone: true, url: true })
  const [sections, setSections] = useState<PdfSection[]>(() =>
    structure.sections
      .filter((s) => s.key !== 'basics')
      .map((s) => ({ key: s.key as Exclude<SectionKey, 'basics'>, visible: s.visible }))
  )

  const toggleBasics = (field: keyof BasicsFields) =>
    setBasicsFields((prev) => ({ ...prev, [field]: !prev[field] }))

  const toggleSection = (key: Exclude<SectionKey, 'basics'>) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)))

  const pdfStructure = useMemo<ResumeStructure>(() => ({
    ...structure,
    sections: [{ key: 'basics', visible: true }, ...sections],
  }), [structure, sections])

  const activeFonts = format === 'pdf' ? PDF_FONTS : DOCX_FONTS
  const activeFont  = format === 'pdf' ? pdfFont   : docxFont
  const setActiveFont = (id: string) =>
    format === 'pdf' ? setPdfFont(id as PdfFont) : setDocxFont(id as DocxFont)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex h-[620px]">

          {/* ── Left: controls ── */}
          <div className="flex flex-col w-72 flex-shrink-0 border-r">
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

              <DialogHeader>
                <DialogTitle>Export Resume</DialogTitle>
                <DialogDescription>Choose format and customise before downloading.</DialogDescription>
              </DialogHeader>

              {/* Format selector */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Format</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormat('docx')}
                    className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 transition-colors text-left ${
                      format === 'docx' ? 'border-foreground bg-muted' : 'border-border bg-muted/20 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm font-medium">DOCX</span>
                    <span className="text-[10px] text-muted-foreground">ATS recommended</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('pdf')}
                    className={`flex flex-col items-start gap-0.5 rounded-md border px-3 py-2.5 transition-colors text-left ${
                      format === 'pdf' ? 'border-foreground bg-muted' : 'border-border bg-muted/20 hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm font-medium">PDF</span>
                    <span className="text-[10px] text-muted-foreground">Formatted layout</span>
                  </button>
                </div>
              </div>

              {/* Font */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Font</p>
                <div className={`grid gap-1.5 ${activeFonts.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  {activeFonts.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFont(f.id)}
                      className={`flex flex-col items-center gap-1 rounded-md border py-2.5 transition-colors ${
                        activeFont === f.id
                          ? 'border-foreground bg-muted'
                          : 'border-border bg-muted/20 hover:bg-muted/50'
                      }`}
                    >
                      <span className="text-lg font-semibold leading-none" style={{ fontFamily: f.style }}>Aa</span>
                      <span className="text-[11px] font-medium">{f.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Header fields */}
              {(basics.email || basics.phone || basics.url || basics.summary) && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Header</p>
                  {basics.email   && <ToggleRow label="Email"   visible={basicsFields.email}   onToggle={() => toggleBasics('email')}   />}
                  {basics.phone   && <ToggleRow label="Phone"   visible={basicsFields.phone}   onToggle={() => toggleBasics('phone')}   />}
                  {basics.url     && <ToggleRow label="Website" visible={basicsFields.url}     onToggle={() => toggleBasics('url')}     />}
                  {basics.summary && <ToggleRow label="Summary" visible={basicsFields.summary} onToggle={() => toggleBasics('summary')} />}
                </div>
              )}

              {/* Sections */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sections</p>
                <Reorder.Group as="div" axis="y" values={sections} onReorder={setSections} className="flex flex-col gap-1">
                  {sections.map((sec) => (
                    <SectionRow key={sec.key} section={sec} onToggle={() => toggleSection(sec.key)} />
                  ))}
                </Reorder.Group>
              </div>
            </div>

            {/* Sticky download */}
            <div className="px-5 py-4 border-t flex-shrink-0">
              {format === 'docx' ? (
                <DocxDownloadButton
                  className="w-full"
                  content={content}
                  structure={pdfStructure}
                  basicsFields={basicsFields}
                  font={docxFont}
                />
              ) : (
                <PdfLink content={content} structure={pdfStructure} font={pdfFont} basicsFields={basicsFields}>
                  {({ loading }) => (
                    <Button className="w-full" disabled={loading}>
                      <Download size={13} />
                      {loading ? 'Preparing…' : 'Download PDF'}
                    </Button>
                  )}
                </PdfLink>
              )}
            </div>
          </div>

          {/* ── Right: preview ── */}
          <div className="flex-1 hidden sm:flex flex-col bg-muted/20">
            {format === 'pdf' ? (
              <PdfPreview
                content={content}
                structure={pdfStructure}
                font={pdfFont}
                basicsFields={basicsFields}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <FileText size={18} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">DOCX preview unavailable</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Live preview is only supported for PDF. Your DOCX will follow ATS best practices — single column, standard font, months in all dates.
                </p>
                <p className="text-xs text-muted-foreground">
                  Switch to <button type="button" onClick={() => setFormat('pdf')} className="underline underline-offset-2 hover:text-foreground transition-colors">PDF</button> to see a preview.
                </p>
              </div>
            )}
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
