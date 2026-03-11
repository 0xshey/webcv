import { GripVertical } from 'lucide-react'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import type { DraggableAttributes } from '@dnd-kit/core'

interface DragHandleProps {
  listeners?: SyntheticListenerMap
  attributes?: DraggableAttributes
}

export function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <button
      type="button"
      className="cursor-grab touch-none text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      {...listeners}
      {...attributes}
      aria-label="Drag to reorder"
    >
      <GripVertical size={16} />
    </button>
  )
}
