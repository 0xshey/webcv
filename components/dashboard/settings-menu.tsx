'use client'

import { useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSizeMode } from '@/components/providers/size-mode-provider'

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'font-medium text-foreground transition-colors'
          : 'text-muted-foreground/40 hover:text-muted-foreground transition-colors'
      }
    >
      {children}
    </button>
  )
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useSizeMode()

  // Client-only flag — no setState in effect, no hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const openMenu = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      })
    }
    setOpen(true)
  }, [])

  const closeMenu = useCallback(() => setOpen(false), [])

  const menu = open && (
    <>
      {/* Full-page dim backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/70 animate-in fade-in duration-150"
        onClick={closeMenu}
      />

      {/* Floating options — no background, just text in front of dim */}
      <div
        className="fixed z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-150"
        style={{ top: pos.top, right: pos.right }}
      >
        {/* Theme row */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/40 w-8">Theme</span>
          <div className="flex items-center gap-2.5">
            <OptionButton active={theme === 'light'} onClick={() => setTheme('light')}>Light</OptionButton>
            <OptionButton active={theme === 'dark'} onClick={() => setTheme('dark')}>Dark</OptionButton>
            <OptionButton active={theme === 'system'} onClick={() => setTheme('system')}>System</OptionButton>
          </div>
        </div>

        {/* Text size row */}
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/40 w-8">Text</span>
          <div className="flex items-center gap-2.5">
            <OptionButton active={mode === 'compact'} onClick={() => setMode('compact')}>Small</OptionButton>
            <OptionButton active={mode === 'default'} onClick={() => setMode('default')}>Large</OptionButton>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon-sm"
        onClick={open ? closeMenu : openMenu}
        title="Settings"
        className="text-muted-foreground"
      >
        <SlidersHorizontal size={13} />
      </Button>

      {mounted && createPortal(menu, document.body)}
    </>
  )
}
