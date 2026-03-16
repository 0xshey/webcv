'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, GripVertical } from 'lucide-react'
import { useResume } from '@/components/providers/resume-provider'
import { BlockEditor } from './editor'
import type { SectionKey } from '@/lib/types'

interface SortableBlockProps {
  id: string
  section: Exclude<SectionKey, 'basics'>
  label: string
  initialValues: Record<string, unknown>
}

export function SortableBlock({ id, section, label, initialValues }: SortableBlockProps) {
  const { dispatch } = useResume()
  const [expanded, setExpanded] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="group/block">
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          type="button"
          className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground/25 group-hover/block:text-muted-foreground/50 transition-colors flex-shrink-0 touch-none"
          tabIndex={-1}
          aria-label="Drag to reorder"
        >
          <GripVertical size={13} />
        </button>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            className="w-full text-left text-sm"
            onClick={() => setExpanded((v) => !v)}
          >
            {label || <span className="text-muted-foreground/30 italic">untitled</span>}
          </button>
          {expanded && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <BlockEditor section={section} blockId={id} initialValues={initialValues} />
            </div>
          )}
        </div>
        <button
          type="button"
          className="mt-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive flex-shrink-0"
          onClick={() => dispatch({ type: 'DELETE_BLOCK', section, id })}
          aria-label="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
