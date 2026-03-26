'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useResume } from '@/components/providers/resume-provider'
import { SortableBlock } from '../block/sortable'
import { AddBlockButton } from '../block/add-button'
import type { SectionKey } from '@/lib/types'

function getBlockLabel(section: Exclude<SectionKey, 'basics'>, item: Record<string, unknown>): string {
  switch (section) {
    case 'work': return String(item.name ?? '') || String(item.position ?? '')
    case 'education': return String(item.institution ?? '')
    case 'skills': return String(item.name ?? '')
    case 'projects': return String(item.name ?? '')
    case 'volunteer': return String(item.organization ?? '')
    case 'awards': return String(item.title ?? '')
    case 'publications': return String(item.name ?? '')
    case 'languages': return String(item.language ?? '')
    case 'interests': return String(item.name ?? '')
    case 'references': return String(item.name ?? '')
    case 'certificates': return String(item.name ?? '')
    default: return ''
  }
}

interface SortableSectionProps {
  section: Exclude<SectionKey, 'basics'>
  items: Array<Record<string, unknown> & { id: string }>
}

export function SortableSection({ section, items }: SortableSectionProps) {
  const { dispatch } = useResume()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(items, oldIndex, newIndex)
    dispatch({
      type: 'REORDER_BLOCKS',
      section,
      ids: reordered.map((i) => i.id),
    })
  }

  if (!mounted) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="text-sm pl-5">
            {getBlockLabel(section, item) || '(untitled)'}
          </div>
        ))}
        <AddBlockButton section={section} />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableBlock
              key={item.id}
              id={item.id}
              section={section}
              initialValues={item}
            />
          ))}
          <AddBlockButton section={section} />
        </div>
      </SortableContext>
    </DndContext>
  )
}
