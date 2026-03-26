'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  ResumeContent,
  ResumeStructure,
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

type ArraySectionKey = Exclude<SectionKey, 'basics'>

type SectionItem =
  | ResumeWorkItem
  | ResumeEducationItem
  | ResumeSkillItem
  | ResumeProjectItem
  | ResumeVolunteerItem
  | ResumeAwardItem
  | ResumePublicationItem
  | ResumeLanguageItem
  | ResumeInterestItem
  | ResumeReferenceItem
  | ResumeCertificateItem

export type Action =
  | { type: 'UPDATE_BASICS'; payload: Partial<ResumeContent['basics']> }
  | { type: 'UPDATE_BLOCK'; section: ArraySectionKey; id: string; payload: Partial<SectionItem> }
  | { type: 'ADD_BLOCK'; section: ArraySectionKey; item: SectionItem }
  | { type: 'DELETE_BLOCK'; section: ArraySectionKey; id: string }
  | { type: 'REORDER_BLOCKS'; section: ArraySectionKey; ids: string[] }
  | { type: 'REORDER_SECTIONS'; ids: SectionKey[] }
  | { type: 'TOGGLE_SECTION'; key: SectionKey }
  | { type: 'SET_LAYOUT'; columns: 1 | 2 }
  | { type: 'SET_SAVING' }
  | { type: 'SET_SAVED' }
  | { type: 'SET_ERROR'; error: string }

export interface ResumeState {
  content: ResumeContent
  structure: ResumeStructure
  isDirty: boolean
  isSaving: boolean
  error: string | null
  resumeId: string
}

interface ResumeContextValue extends ResumeState {
  dispatch: React.Dispatch<Action>
  isEditMode: boolean
  toggleEditMode: () => void
  saveAndExit: () => Promise<void>
}

const ResumeContext = createContext<ResumeContextValue | null>(null)

function getSection<T>(content: ResumeContent, key: ArraySectionKey): T[] {
  return (content[key] as T[] | undefined) ?? []
}

export function reducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'UPDATE_BASICS':
      return {
        ...state,
        content: {
          ...state.content,
          basics: { ...state.content.basics, ...action.payload },
        },
        isDirty: true,
      }

    case 'UPDATE_BLOCK': {
      const items = getSection<SectionItem>(state.content, action.section)
      return {
        ...state,
        content: {
          ...state.content,
          [action.section]: items.map((item) =>
            item.id === action.id ? { ...item, ...action.payload } : item
          ),
        },
        isDirty: true,
      }
    }

    case 'ADD_BLOCK': {
      const items = getSection<SectionItem>(state.content, action.section)
      return {
        ...state,
        content: {
          ...state.content,
          [action.section]: [...items, action.item],
        },
        isDirty: true,
      }
    }

    case 'DELETE_BLOCK': {
      const items = getSection<SectionItem>(state.content, action.section)
      return {
        ...state,
        content: {
          ...state.content,
          [action.section]: items.filter((item) => item.id !== action.id),
        },
        isDirty: true,
      }
    }

    case 'REORDER_BLOCKS': {
      const items = getSection<SectionItem>(state.content, action.section)
      const ordered = action.ids
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is SectionItem => item !== undefined)
      return {
        ...state,
        content: { ...state.content, [action.section]: ordered },
        isDirty: true,
      }
    }

    case 'REORDER_SECTIONS': {
      const ordered = action.ids
        .map((id) =>
          state.structure.sections.find((s) => s.key === id)
        )
        .filter(
          (s): s is ResumeStructure['sections'][0] => s !== undefined
        )
      return {
        ...state,
        structure: { ...state.structure, sections: ordered },
        isDirty: true,
      }
    }

    case 'TOGGLE_SECTION':
      return {
        ...state,
        structure: {
          ...state.structure,
          sections: state.structure.sections.map((s) =>
            s.key === action.key ? { ...s, visible: !s.visible } : s
          ),
        },
        isDirty: true,
      }

    case 'SET_LAYOUT':
      return {
        ...state,
        structure: {
          ...state.structure,
          layout: { columns: action.columns },
        },
        isDirty: true,
      }

    case 'SET_SAVING':
      return { ...state, isSaving: true, error: null }

    case 'SET_SAVED':
      return { ...state, isSaving: false, isDirty: false }

    case 'SET_ERROR':
      return { ...state, isSaving: false, error: action.error }

    default:
      return state
  }
}

interface ResumeProviderProps {
  children: ReactNode
  initialContent: ResumeContent
  initialStructure: ResumeStructure
  resumeId: string
}

export function ResumeProvider({
  children,
  initialContent,
  initialStructure,
  resumeId,
}: ResumeProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  const [state, dispatch] = useReducer(reducer, {
    content: initialContent,
    structure: initialStructure,
    isDirty: false,
    isSaving: false,
    error: null,
    resumeId,
  })

  const saveAndExit = useCallback(async () => {
    dispatch({ type: 'SET_SAVING' })
    const supabase = createClient()
    const { error } = await supabase
      .from('resumes')
      .update({
        content: state.content,
        structure: state.structure,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resumeId)

    if (error) {
      dispatch({ type: 'SET_ERROR', error: error.message })
      toast.error('Failed to save resume')
    } else {
      dispatch({ type: 'SET_SAVED' })
      const params = new URLSearchParams(searchParams.toString())
      params.delete('edit')
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    }
  }, [state.content, state.structure, resumeId, pathname, router, searchParams])

  const toggleEditMode = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (!isEditMode) {
      params.set('edit', 'true')
    } else {
      params.delete('edit')
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname)
  }, [isEditMode, pathname, router, searchParams])

  return (
    <ResumeContext.Provider
      value={{ ...state, dispatch, isEditMode, toggleEditMode, saveAndExit }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within ResumeProvider')
  return ctx
}
