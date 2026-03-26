'use client'

import { useState, useRef, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Ellipsis, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { useSizeMode } from '@/components/providers/size-mode-provider'

export function SettingsMenu() {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { theme, setTheme } = useTheme()
  const { mode, setMode } = useSizeMode()
  const { signOut } = useAuth()
  const router = useRouter()

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

  const handleSignOut = async () => {
    closeMenu()
    await signOut()
    router.push('/')
  }

  const menu = open && (
    <>
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm bg-background/50 animate-in fade-in duration-150"
        onClick={closeMenu}
      />

      <div
        className="fixed z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 duration-150"
        style={{ top: pos.top, right: pos.right }}
      >
        {/* Theme */}
        <div className="flex items-center gap-1">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? 'secondary' : 'ghost'}
              onClick={() => setTheme(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-1">
          {(['compact', 'default'] as const).map((m) => (
            <Button
              key={m}
              variant={mode === m ? 'secondary' : 'ghost'}
              onClick={() => setMode(m)}
            >
              {m === 'compact' ? 'Small' : 'Large'}
            </Button>
          ))}
        </div>

        {/* Sign out */}
        <Button variant="ghost" onClick={handleSignOut} className="justify-start">
          <LogOut />
          Sign out
        </Button>
      </div>
    </>
  )

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        onClick={open ? closeMenu : openMenu}
        title="More"
      >
        <Ellipsis />
      </Button>

      {mounted && createPortal(menu, document.body)}
    </>
  )
}
