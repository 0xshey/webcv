'use client'

import { useState } from 'react'
import { useHydrated } from '@/lib/hooks'
import { Reorder } from 'framer-motion'
import { useResume } from '@/components/providers/resume-provider'
import { SortableBlock } from '../block/sortable'
import { AddBlockButton } from '../block/add-button'
import type { SectionKey } from '@/lib/types'

type BlockItem = Record<string, unknown> & { id: string }

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
  items: BlockItem[]
}

export function SortableSection({ section, items }: SortableSectionProps) {
  const { dispatch } = useResume()
  const [localItems, setLocalItems] = useState(items)
  const [newItemId, setNewItemId] = useState<string | null>(null)
  const mounted = useHydrated()

  // Sync when items change externally (add / delete / edit)
  useEffect(() => {
    setLocalItems((prev) => {
      // Preserve local order, apply content updates, add new, remove deleted
      const prevIds = prev.map((i) => i.id)
      const nextIds = items.map((i) => i.id)
      const kept = prev
        .filter((i) => nextIds.includes(i.id))
        .map((i) => items.find((ni) => ni.id === i.id) ?? i)
      const added = items.filter((i) => !prevIds.includes(i.id))
      return [...kept, ...added]
    })
  }, [items])

  const handleReorder = (reordered: BlockItem[]) => {
    setLocalItems(reordered)
    dispatch({ type: 'REORDER_BLOCKS', section, ids: reordered.map((i) => i.id) })
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
    <div className="flex flex-col gap-2">
      <Reorder.Group
        as="div"
        axis="y"
        values={localItems}
        onReorder={handleReorder}
        className="flex flex-col gap-2"
      >
        {localItems.map((item) => (
          <SortableBlock
            key={item.id}
            item={item}
            section={section}
            defaultExpanded={item.id === newItemId}
          />
        ))}
      </Reorder.Group>
      <AddBlockButton section={section} onAdd={setNewItemId} />
    </div>
  )
}
