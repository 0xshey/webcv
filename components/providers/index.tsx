'use client'

import type { ReactNode } from 'react'
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from './auth-provider'
import { SizeModeProvider } from './size-mode-provider'

function ThemedToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      richColors
      position="bottom-right"
      theme={resolvedTheme as 'light' | 'dark' | undefined}
    />
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SizeModeProvider>
        {children}
      </SizeModeProvider>
      <ThemedToaster />
    </AuthProvider>
  )
}
