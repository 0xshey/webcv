import { describe, it, expect } from 'vitest'
import { reducer } from '@/components/providers/resume-provider'
import { makeState } from '../../helpers/resume-fixtures'
import type { ResumeWorkItem } from '@/lib/types'

const workItem: ResumeWorkItem = {
  id: 'w1',
  name: 'Acme Corp',
  position: 'Engineer',
  startDate: '2020-01',
}

describe('reducer', () => {
  describe('UPDATE_BASICS', () => {
    it('merges partial basics into state.content.basics', () => {
      const state = makeState()
      const next = reducer(state, { type: 'UPDATE_BASICS', payload: { name: 'John' } })
      expect(next.content.basics.name).toBe('John')
      expect(next.content.basics.email).toBe(state.content.basics.email)
    })

    it('sets isDirty to true', () => {
      const state = makeState({ isDirty: false })
      const next = reducer(state, { type: 'UPDATE_BASICS', payload: { name: 'John' } })
      expect(next.isDirty).toBe(true)
    })

    it('does not mutate other content sections', () => {
      const state = makeState({ content: { basics: { name: 'Jane', email: 'j@e.com', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'UPDATE_BASICS', payload: { name: 'John' } })
      expect(next.content.work).toEqual([workItem])
    })
  })

  describe('UPDATE_BLOCK', () => {
    it('updates a matching item by id in the given section', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, {
        type: 'UPDATE_BLOCK',
        section: 'work',
        id: 'w1',
        payload: { name: 'New Corp' },
      })
      expect(next.content.work?.[0]?.name).toBe('New Corp')
    })

    it('does not modify other items in the section', () => {
      const item2: ResumeWorkItem = { id: 'w2', name: 'Other', position: 'Dev', startDate: '2021-01' }
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem, item2] } })
      const next = reducer(state, { type: 'UPDATE_BLOCK', section: 'work', id: 'w1', payload: { name: 'Changed' } })
      expect(next.content.work?.[1]?.name).toBe('Other')
    })

    it('sets isDirty to true', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'UPDATE_BLOCK', section: 'work', id: 'w1', payload: { name: 'X' } })
      expect(next.isDirty).toBe(true)
    })

    it('leaves state unchanged when id is not found', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'UPDATE_BLOCK', section: 'work', id: 'nonexistent', payload: { name: 'X' } })
      expect(next.content.work?.[0]?.name).toBe('Acme Corp')
    })
  })

  describe('ADD_BLOCK', () => {
    it('appends the new item to the section array', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const newItem: ResumeWorkItem = { id: 'w2', name: 'New Co', position: 'Dev', startDate: '' }
      const next = reducer(state, { type: 'ADD_BLOCK', section: 'work', item: newItem })
      expect(next.content.work).toHaveLength(2)
      expect(next.content.work?.[1]?.id).toBe('w2')
    })

    it('sets isDirty to true', () => {
      const state = makeState()
      const next = reducer(state, { type: 'ADD_BLOCK', section: 'work', item: workItem })
      expect(next.isDirty).toBe(true)
    })

    it('handles adding to an undefined section', () => {
      const state = makeState()
      const next = reducer(state, { type: 'ADD_BLOCK', section: 'work', item: workItem })
      expect(next.content.work).toHaveLength(1)
    })
  })

  describe('DELETE_BLOCK', () => {
    it('removes the item with the matching id', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'DELETE_BLOCK', section: 'work', id: 'w1' })
      expect(next.content.work).toHaveLength(0)
    })

    it('sets isDirty to true', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'DELETE_BLOCK', section: 'work', id: 'w1' })
      expect(next.isDirty).toBe(true)
    })

    it('does not modify state when id is not found', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'DELETE_BLOCK', section: 'work', id: 'nonexistent' })
      expect(next.content.work).toHaveLength(1)
    })
  })

  describe('REORDER_BLOCKS', () => {
    it('reorders items to match the given ids array', () => {
      const item2: ResumeWorkItem = { id: 'w2', name: 'B', position: 'Dev', startDate: '' }
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem, item2] } })
      const next = reducer(state, { type: 'REORDER_BLOCKS', section: 'work', ids: ['w2', 'w1'] })
      expect(next.content.work?.[0]?.id).toBe('w2')
      expect(next.content.work?.[1]?.id).toBe('w1')
    })

    it('sets isDirty to true', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'REORDER_BLOCKS', section: 'work', ids: ['w1'] })
      expect(next.isDirty).toBe(true)
    })

    it('drops ids that do not exist in current items', () => {
      const state = makeState({ content: { basics: { name: '', email: '', summary: '' }, work: [workItem] } })
      const next = reducer(state, { type: 'REORDER_BLOCKS', section: 'work', ids: ['w1', 'nonexistent'] })
      expect(next.content.work).toHaveLength(1)
    })
  })

  describe('REORDER_SECTIONS', () => {
    it('reorders structure.sections to match the given ids array', () => {
      const state = makeState()
      const currentKeys = state.structure.sections.map((s) => s.key)
      const reversed = [...currentKeys].reverse()
      const next = reducer(state, { type: 'REORDER_SECTIONS', ids: reversed })
      expect(next.structure.sections.map((s) => s.key)).toEqual(reversed)
    })

    it('sets isDirty to true', () => {
      const state = makeState()
      const keys = state.structure.sections.map((s) => s.key)
      const next = reducer(state, { type: 'REORDER_SECTIONS', ids: keys })
      expect(next.isDirty).toBe(true)
    })
  })

  describe('TOGGLE_SECTION', () => {
    it('flips visible from true to false for matching key', () => {
      const state = makeState()
      const next = reducer(state, { type: 'TOGGLE_SECTION', key: 'work' })
      const workSection = next.structure.sections.find((s) => s.key === 'work')
      expect(workSection?.visible).toBe(false)
    })

    it('flips visible from false to true for matching key', () => {
      const state = makeState({
        structure: {
          sections: [{ key: 'basics', visible: true }, { key: 'work', visible: false }],
          layout: { columns: 1 },
        },
      })
      const next = reducer(state, { type: 'TOGGLE_SECTION', key: 'work' })
      const workSection = next.structure.sections.find((s) => s.key === 'work')
      expect(workSection?.visible).toBe(true)
    })

    it('does not affect other sections', () => {
      const state = makeState()
      const next = reducer(state, { type: 'TOGGLE_SECTION', key: 'work' })
      const basicsSection = next.structure.sections.find((s) => s.key === 'basics')
      expect(basicsSection?.visible).toBe(true)
    })

    it('sets isDirty to true', () => {
      const state = makeState()
      const next = reducer(state, { type: 'TOGGLE_SECTION', key: 'work' })
      expect(next.isDirty).toBe(true)
    })
  })

  describe('SET_LAYOUT', () => {
    it('sets layout.columns to 1', () => {
      const state = makeState({ structure: { ...makeState().structure, layout: { columns: 2 } } })
      const next = reducer(state, { type: 'SET_LAYOUT', columns: 1 })
      expect(next.structure.layout.columns).toBe(1)
    })

    it('sets layout.columns to 2', () => {
      const state = makeState()
      const next = reducer(state, { type: 'SET_LAYOUT', columns: 2 })
      expect(next.structure.layout.columns).toBe(2)
    })

    it('sets isDirty to true', () => {
      const state = makeState()
      const next = reducer(state, { type: 'SET_LAYOUT', columns: 2 })
      expect(next.isDirty).toBe(true)
    })
  })

  describe('SET_SAVING', () => {
    it('sets isSaving to true', () => {
      const state = makeState({ isSaving: false })
      const next = reducer(state, { type: 'SET_SAVING' })
      expect(next.isSaving).toBe(true)
    })

    it('clears error to null', () => {
      const state = makeState({ error: 'previous error' })
      const next = reducer(state, { type: 'SET_SAVING' })
      expect(next.error).toBeNull()
    })
  })

  describe('SET_SAVED', () => {
    it('sets isSaving to false', () => {
      const state = makeState({ isSaving: true })
      const next = reducer(state, { type: 'SET_SAVED' })
      expect(next.isSaving).toBe(false)
    })

    it('sets isDirty to false', () => {
      const state = makeState({ isDirty: true })
      const next = reducer(state, { type: 'SET_SAVED' })
      expect(next.isDirty).toBe(false)
    })
  })

  describe('SET_ERROR', () => {
    it('sets isSaving to false', () => {
      const state = makeState({ isSaving: true })
      const next = reducer(state, { type: 'SET_ERROR', error: 'Something failed' })
      expect(next.isSaving).toBe(false)
    })

    it('stores the error string on state.error', () => {
      const state = makeState()
      const next = reducer(state, { type: 'SET_ERROR', error: 'Network error' })
      expect(next.error).toBe('Network error')
    })
  })
})
