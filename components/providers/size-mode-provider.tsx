'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type SizeMode = 'compact' | 'default'

const SizeModeContext = createContext<{
  mode: SizeMode
  setMode: (mode: SizeMode) => void
}>({
  mode: 'compact',
  setMode: () => {},
})

export function useSizeMode() {
  return useContext(SizeModeContext)
}

export function SizeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SizeMode>(() => {
    if (typeof window === 'undefined') return 'compact'
    return (localStorage.getItem('cv-size-mode') as SizeMode) ?? 'compact'
  })

  useEffect(() => {
    if (mode === 'compact') {
      document.body.classList.remove('cv-size-default')
    } else {
      document.body.classList.add('cv-size-default')
    }
  }, [mode])

  const setMode = (next: SizeMode) => {
    setModeState(next)
    localStorage.setItem('cv-size-mode', next)
  }

  return (
    <SizeModeContext.Provider value={{ mode, setMode }}>
      {children}
    </SizeModeContext.Provider>
  )
}
