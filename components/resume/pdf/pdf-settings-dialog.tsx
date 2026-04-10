'use client'

import { useState, useRef, useMemo } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { GripVertical, Eye, EyeOff, Download } from 'lucide-react'
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

const FONTS: { id: PdfFont; label: string; description: string; style: string }[] = [
  { id: 'Helvetica',   label: 'Helvetica', description: 'Sans-serif', style: 'Helvetica, Arial, sans-serif'       },
  { id: 'Times-Roman', label: 'Times',     description: 'Serif',      style: '"Times New Roman", Times, serif'    },
  { id: 'Courier',     label: 'Courier',   description: 'Monospace',  style: '"Courier New", Courier, monospace'  },
]

interface PdfSection {
  key: Exclude<SectionKey, 'basics'>
  visible: boolean
}

function ToggleRow({ label, visible, onToggle }: { label: string; visible: boolean; onToggle: () => void }) {
  return (
    <div className={`flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/40 transition-opacity ${!visible ? 'opacity-40' : ''}`}>
      <span className="flex-1 text-sm">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
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
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 bg-muted/40 select-none transition-opacity ${
        !section.visible ? 'opacity-40' : ''
      }`}
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
      <button
        type="button"
        onClick={onToggle}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
      >
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

  const [font, setFont] = useState<PdfFont>('Helvetica')
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
    sections: [
      { key: 'basics', visible: true },
      ...sections,
    ],
  }), [structure, sections])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[820px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="flex h-[620px]">

          {/* ── Left: controls ── */}
          <div className="flex flex-col w-72 flex-shrink-0 border-r">
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

              <DialogHeader>
                <DialogTitle>Export PDF</DialogTitle>
                <DialogDescription>Customise before downloading.</DialogDescription>
              </DialogHeader>

              {/* Font */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Font</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFont(f.id)}
                      className={`flex flex-col items-center gap-1 rounded-md border py-2.5 transition-colors ${
                        font === f.id
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
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={sections}
                  onReorder={setSections}
                  className="flex flex-col gap-1"
                >
                  {sections.map((sec) => (
                    <SectionRow key={sec.key} section={sec} onToggle={() => toggleSection(sec.key)} />
                  ))}
                </Reorder.Group>
              </div>
            </div>

            {/* Sticky download */}
            <div className="px-5 py-4 border-t flex-shrink-0">
              <PdfLink content={content} structure={pdfStructure} font={font} basicsFields={basicsFields}>
                {({ loading }) => (
                  <Button className="w-full" disabled={loading}>
                    <Download size={13} />
                    {loading ? 'Preparing…' : 'Download PDF'}
                  </Button>
                )}
              </PdfLink>
            </div>
          </div>

          {/* ── Right: preview ── */}
          <div className="flex-1 bg-muted/20 hidden sm:block relative">
            <PdfPreview
              content={content}
              structure={pdfStructure}
              font={font}
              basicsFields={basicsFields}
            />
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
