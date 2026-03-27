'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import { useResume } from '@/components/providers/resume-provider'
import { Button } from '@/components/ui/button'
import { BlockEditor } from './editor'
import {
  WorkBlock,
  EducationBlock,
  SkillBlock,
  ProjectBlock,
  VolunteerBlock,
  AwardBlock,
  PublicationBlock,
  LanguageBlock,
  InterestBlock,
  ReferenceBlock,
  CertificateBlock,
} from './view'
import type {
  SectionKey,
  ResumeWorkItem,
  ResumeEducationItem,
  ResumeSkillItem,
  ResumeProjectItem,
  ResumeVolunteerItem,
  ResumeAwardItem,
  ResumePublicationItem,
  ResumeLanguageItem,
  ResumeInterestItem,
  ResumeReferenceItem,
  ResumeCertificateItem,
} from '@/lib/types'

type Item = Record<string, unknown>

function BlockPreview({
  section,
  item,
}: {
  section: Exclude<SectionKey, 'basics'>
  item: Item
}) {
  switch (section) {
    case 'work':         return <WorkBlock item={item as unknown as ResumeWorkItem} />
    case 'education':    return <EducationBlock item={item as unknown as ResumeEducationItem} />
    case 'skills':       return <SkillBlock item={item as unknown as ResumeSkillItem} />
    case 'projects':     return <ProjectBlock item={item as unknown as ResumeProjectItem} />
    case 'volunteer':    return <VolunteerBlock item={item as unknown as ResumeVolunteerItem} />
    case 'awards':       return <AwardBlock item={item as unknown as ResumeAwardItem} />
    case 'publications': return <PublicationBlock item={item as unknown as ResumePublicationItem} />
    case 'languages':    return <LanguageBlock item={item as unknown as ResumeLanguageItem} />
    case 'interests':    return <InterestBlock item={item as unknown as ResumeInterestItem} />
    case 'references':   return <ReferenceBlock item={item as unknown as ResumeReferenceItem} />
    case 'certificates': return <CertificateBlock item={item as unknown as ResumeCertificateItem} />
  }
}

interface SortableBlockProps {
  id: string
  section: Exclude<SectionKey, 'basics'>
  initialValues: Record<string, unknown>
  defaultExpanded?: boolean
}

export function SortableBlock({ id, section, initialValues, defaultExpanded = false }: SortableBlockProps) {
  const { content, dispatch } = useResume()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const didDragRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!defaultExpanded) return
    const timer = setTimeout(() => {
      containerRef.current?.querySelector<HTMLElement>('input, textarea')?.focus()
    }, 150)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!expanded) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [expanded])

  const liveItem =
    (content[section] as Item[] | undefined)?.find((i) => i.id === id) ?? initialValues

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={containerRef}>
    <div ref={setNodeRef} style={style} className="group/block">
      <div
        className={`flex items-start gap-1.5 transition-all duration-200 ease-in-out bg-muted/60 rounded-lg p-3 ${!expanded ? 'cursor-pointer' : ''}`}
        onClick={() => { if (!expanded) setExpanded(true) }}
      >
        {/* Grip — also acts as click-to-collapse when expanded */}
        <button
          {...attributes}
          {...listeners}
          type="button"
          tabIndex={-1}
          aria-label={expanded ? 'Collapse' : 'Drag to reorder'}
          onMouseDown={() => { didDragRef.current = false }}
          onMouseMove={() => { didDragRef.current = true }}
          onClick={(e) => { e.stopPropagation(); if (!didDragRef.current) setExpanded((v) => !v) }}
          className={`mt-0.5 flex-shrink-0 touch-none transition-colors ${
            expanded
              ? 'cursor-pointer text-muted-foreground/50'
              : 'cursor-grab active:cursor-grabbing text-muted-foreground/25 group-hover/block:text-muted-foreground/50'
          }`}
        >
          <GripVertical size={13} />
        </button>

        <div className="flex-1 min-w-0 relative">
          {/* Preview — collapses and fades out when expanded */}
          <div
            className="grid transition-[grid-template-rows,opacity] duration-200 ease-in-out"
            style={{
              gridTemplateRows: expanded ? '0fr' : '1fr',
              opacity: expanded ? 0 : 1,
            }}
          >
            <div className="overflow-hidden min-h-0">
              <div className="pointer-events-none">
                <BlockPreview section={section} item={liveItem} />
              </div>
            </div>
          </div>

          {/* Editor — expands and fades in */}
          <div
            className="grid transition-[grid-template-rows,opacity] duration-200 ease-in-out"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
              opacity: expanded ? 1 : 0,
            }}
          >
            <div className="overflow-hidden min-h-0">
              <BlockEditor section={section} blockId={id} initialValues={initialValues} />
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="mt-0.5 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_BLOCK', section, id }) }}
          aria-label="Delete"
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
    </div>
  )
}
