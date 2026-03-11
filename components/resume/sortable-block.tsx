'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useResume } from '@/components/providers/resume-provider'
import { DragHandle } from './drag-handle'
import { BlockEditor } from './block-editor'
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
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-[var(--border)] bg-white"
    >
      <div className="flex items-center gap-2 p-2">
        <DragHandle listeners={listeners} attributes={attributes} />
        <button
          type="button"
          className="flex-1 text-left text-sm font-medium"
          onClick={() => setExpanded((v) => !v)}
        >
          {label || `(untitled)`}
        </button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-400 hover:text-red-600"
          onClick={() => dispatch({ type: 'DELETE_BLOCK', section, id })}
        >
          <Trash2 size={14} />
        </Button>
      </div>
      {expanded && (
        <div className="border-t border-[var(--border)] p-3">
          <BlockEditor section={section} blockId={id} initialValues={initialValues} />
        </div>
      )}
    </div>
  )
}
