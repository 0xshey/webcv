'use client'

import { useState, useRef } from 'react'
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

const FONTS: { id: PdfFont; label: string; sample: string; description: string }[] = [
  { id: 'Helvetica',   label: 'Helvetica', sample: 'Aa', description: 'Sans-serif' },
  { id: 'Times-Roman', label: 'Times',     sample: 'Aa', description: 'Serif'      },
  { id: 'Courier',     label: 'Courier',   sample: 'Aa', description: 'Monospace'  },
]

interface PdfSection {
  key: Exclude<SectionKey, 'basics'>
  visible: boolean
}

function ToggleRow({
  label,
  visible,
  onToggle,
}: {
  label: string
  visible: boolean
  onToggle: () => void
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-md px-2 py-2 bg-muted/50 ${!visible ? 'opacity-40' : ''}`}>
      <span className="flex-1 text-sm">{label}</span>
      <button
        type="button"
        onClick={onToggle}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
      >
        {visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
    </div>
  )
}

function SectionRow({
  section,
  onToggle,
}: {
  section: PdfSection
  onToggle: () => void
}) {
  const dragControls = useDragControls()
  const didDragRef = useRef(false)

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragControls={dragControls}
      dragListener={false}
      whileDrag={{ scale: 1.02, opacity: 0.85, zIndex: 50 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center gap-2.5 rounded-md px-2 py-2 bg-muted/50 select-none ${
        !section.visible ? 'opacity-40' : ''
      }`}
    >
      <button
        type="button"
        tabIndex={-1}
        onPointerDown={(e) => {
          didDragRef.current = false
          dragControls.start(e)
        }}
        onPointerMove={() => { didDragRef.current = true }}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors flex-shrink-0"
      >
        <GripVertical size={14} />
      </button>

      <span className="flex-1 text-sm">{SECTION_LABELS[section.key]}</span>

      <button
        type="button"
        onClick={onToggle}
        className="text-muted-foreground/50 hover:text-muted-foreground transition-colors flex-shrink-0"
      >
        {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
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

export function PdfSettingsDialog({
  open,
  onOpenChange,
  content,
  structure,
}: PdfSettingsDialogProps) {
  const { basics } = content

  const [font, setFont] = useState<PdfFont>('Helvetica')
  const [basicsFields, setBasicsFields] = useState<BasicsFields>({
    summary: true,
    email: true,
    phone: true,
    url: true,
  })
  const [sections, setSections] = useState<PdfSection[]>(() =>
    structure.sections
      .filter((s): s is { key: Exclude<SectionKey, 'basics'>; visible: boolean } => s.key !== 'basics')
      .map((s) => ({ key: s.key as Exclude<SectionKey, 'basics'>, visible: s.visible }))
  )

  const toggleBasics = (field: keyof BasicsFields) =>
    setBasicsFields((prev) => ({ ...prev, [field]: !prev[field] }))

  const toggleSection = (key: Exclude<SectionKey, 'basics'>) =>
    setSections((prev) => prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s)))

  const pdfStructure: ResumeStructure = {
    ...structure,
    sections: [
      { key: 'basics', visible: true },
      ...sections,
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export PDF</DialogTitle>
          <DialogDescription>
            Customise font and sections before downloading.
          </DialogDescription>
        </DialogHeader>

        {/* Font picker */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Font</p>
          <div className="grid grid-cols-3 gap-2">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFont(f.id)}
                className={`flex flex-col items-center gap-1 rounded-md border px-3 py-3 transition-colors ${
                  font === f.id
                    ? 'border-foreground bg-muted'
                    : 'border-border bg-muted/30 hover:bg-muted/60'
                }`}
              >
                <span
                  className="text-xl font-semibold leading-none"
                  style={{
                    fontFamily:
                      f.id === 'Helvetica'   ? 'Helvetica, Arial, sans-serif' :
                      f.id === 'Times-Roman' ? 'Times New Roman, serif' :
                      'Courier New, monospace',
                  }}
                >
                  {f.sample}
                </span>
                <span className="text-xs font-medium">{f.label}</span>
                <span className="text-[10px] text-muted-foreground">{f.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Basics fields */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Header</p>
          <div className="flex flex-col gap-1.5">
            {basics.email && (
              <ToggleRow label="Email" visible={basicsFields.email} onToggle={() => toggleBasics('email')} />
            )}
            {basics.phone && (
              <ToggleRow label="Phone" visible={basicsFields.phone} onToggle={() => toggleBasics('phone')} />
            )}
            {basics.url && (
              <ToggleRow label="Website" visible={basicsFields.url} onToggle={() => toggleBasics('url')} />
            )}
            {basics.summary && (
              <ToggleRow label="Summary" visible={basicsFields.summary} onToggle={() => toggleBasics('summary')} />
            )}
          </div>
        </div>

        {/* Section list */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Sections</p>
          <Reorder.Group
            as="div"
            axis="y"
            values={sections}
            onReorder={setSections}
            className="flex flex-col gap-1.5"
          >
            {sections.map((sec) => (
              <SectionRow
                key={sec.key}
                section={sec}
                onToggle={() => toggleSection(sec.key)}
              />
            ))}
          </Reorder.Group>
        </div>

        {/* Download */}
        <PdfLink content={content} structure={pdfStructure} font={font} basicsFields={basicsFields}>
          {({ loading }) => (
            <Button className="w-full" disabled={loading}>
              <Download size={14} />
              {loading ? 'Preparing…' : 'Download PDF'}
            </Button>
          )}
        </PdfLink>
      </DialogContent>
    </Dialog>
  )
}
