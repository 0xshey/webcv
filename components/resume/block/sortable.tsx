'use client'

import { useState, useRef, useEffect } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { Trash2, GripVertical } from 'lucide-react'
import { useResume } from '@/components/providers/resume-provider'
import { BlockEditor } from './editor'
import { BLOCK_COMPONENTS } from './view'
import type { SectionKey } from '@/lib/types'

type Item = Record<string, unknown> & { id: string }

function BlockPreview({ section, item }: { section: Exclude<SectionKey, 'basics'>; item: Item }) {
  const BlockComponent = BLOCK_COMPONENTS[section]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BlockComponent item={item as any} />
}

interface SortableBlockProps {
  item: Item
  section: Exclude<SectionKey, 'basics'>
  defaultExpanded?: boolean
}

export function SortableBlock({ item, section, defaultExpanded = false }: SortableBlockProps) {
  const { content, dispatch } = useResume()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const didDragRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  useEffect(() => {
    if (!defaultExpanded) return
    const timer = setTimeout(() => {
      containerRef.current?.querySelector<HTMLElement>('input, textarea')?.focus()
    }, 150)
    return () => clearTimeout(timer)
  }, [defaultExpanded])

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
    (content[section] as Item[] | undefined)?.find((i) => i.id === item.id) ?? item

  return (
    <Reorder.Item
      as="div"
      value={item}
      dragControls={dragControls}
      dragListener={false}
      whileDrag={{ scale: 1.02, opacity: 0.85 }}
      transition={{ duration: 0.15 }}
      className="group/block"
      ref={containerRef}
    >
      <div
        className={`flex items-start gap-1.5 bg-muted rounded-lg p-3 ${!expanded ? 'cursor-pointer' : ''}`}
        onClick={() => { if (!expanded) setExpanded(true) }}
      >
        {/* Grip — drag handle + click to collapse */}
        <button
          type="button"
          tabIndex={-1}
          aria-label={expanded ? 'Collapse' : 'Drag to reorder'}
          onPointerDown={(e) => {
            didDragRef.current = false
            dragControls.start(e)
          }}
          onPointerMove={() => { didDragRef.current = true }}
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
          {/* Preview — collapses when expanded */}
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

          {/* Editor — expands when open */}
          <div
            className="grid transition-[grid-template-rows,opacity] duration-200 ease-in-out"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
              opacity: expanded ? 1 : 0,
            }}
          >
            <div className="overflow-hidden min-h-0">
              <BlockEditor section={section} blockId={item.id} initialValues={item} />
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Delete"
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DELETE_BLOCK', section, id: item.id }) }}
          className="mt-0.5 flex-shrink-0 text-muted-foreground/25 group-hover/block:text-muted-foreground/40 hover:text-destructive/60 transition-colors"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </Reorder.Item>
  )
}
