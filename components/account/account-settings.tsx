'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Check, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ── Schemas ───────────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    current: z.string().min(1, 'Current password is required'),
    next: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  })
type PasswordValues = z.infer<typeof passwordSchema>

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})
type EmailValues = z.infer<typeof emailSchema>

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-z0-9_-]+$/, 'Lowercase letters, numbers, underscores, and hyphens only'),
})
type UsernameValues = z.infer<typeof usernameSchema>

// ── Shared helpers ────────────────────────────────────────────────────────────

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-1.5">{children}</div>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-destructive">{message}</p>
}

// ── Copy link row ─────────────────────────────────────────────────────────────

function CopyLinkRow({ username }: { username: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy profile link"
      className="flex items-center justify-between w-full rounded-md px-3 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
    >
      <span className="text-sm text-muted-foreground truncate min-w-0">
        {url.replace(/^https?:\/\//, '')}
      </span>
      <span className="flex-shrink-0 ml-3 text-muted-foreground/50">
        {copied
          ? <Check size={13} className="text-muted-foreground" />
          : <Copy size={13} />}
      </span>
    </button>
  )
}

// ── Settings row ──────────────────────────────────────────────────────────────

function SettingsRow({ label, description, onClick, destructive = false }: {
  label: string
  description: string
  onClick: () => void
  destructive?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between w-full rounded-md px-3 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
    >
      <div className="flex flex-col gap-0.5">
        <span className={`text-sm ${destructive ? 'text-destructive' : ''}`}>{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </button>
  )
}

// ── Change Username Dialog ────────────────────────────────────────────────────

function ChangeUsernameDialog({ open, onOpenChange, userId, currentUsername, onSuccess }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  userId: string
  currentUsername: string
  onSuccess: (newUsername: string) => void
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsernameValues>({
    resolver: zodResolver(usernameSchema),
    defaultValues: { username: currentUsername },
  })

  const handleClose = (v: boolean) => {
    if (!v) reset({ username: currentUsername })
    onOpenChange(v)
  }

  const onSubmit = async (values: UsernameValues) => {
    if (values.username === currentUsername) { handleClose(false); return }
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ username: values.username })
      .eq('user_id', userId)
    if (error) {
      const msg = error.message.includes('unique') || error.code === '23505'
        ? 'That username is already taken'
        : error.message
      toast.error(msg)
    } else {
      toast.success('Username updated.')
      onSuccess(values.username)
      handleClose(false)
      router.replace(`/${values.username}`)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change username</DialogTitle>
          <DialogDescription className="text-xs">
            Your profile URL will change immediately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <FieldGroup>
            <Label htmlFor="new-username" className="text-xs text-muted-foreground">New username</Label>
            <Input
              id="new-username"
              type="text"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              {...register('username')}
            />
            <FieldError message={errors.username?.message} />
          </FieldGroup>
          <Button type="submit" disabled={isLoading} className="mt-1">
            {isLoading ? 'Saving…' : 'Save username'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Change Password Dialog ────────────────────────────────────────────────────

function ChangePasswordDialog({ open, onOpenChange, email }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  email: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  })

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v) }

  const onSubmit = async (values: PasswordValues) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: values.current,
    })
    if (signInError) {
      toast.error('Current password is incorrect')
      setIsLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: values.next })
    if (error) { toast.error(error.message) }
    else { toast.success('Password updated.'); handleClose(false) }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription className="text-xs">Enter your current password to set a new one.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <FieldGroup>
            <Label htmlFor="current-password" className="text-xs text-muted-foreground">Current password</Label>
            <Input id="current-password" type="password" autoComplete="current-password" {...register('current')} />
            <FieldError message={errors.current?.message} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="new-password" className="text-xs text-muted-foreground">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" {...register('next')} />
            <FieldError message={errors.next?.message} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="confirm-password" className="text-xs text-muted-foreground">Confirm new password</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" {...register('confirm')} />
            <FieldError message={errors.confirm?.message} />
          </FieldGroup>
          <Button type="submit" disabled={isLoading} className="mt-1">
            {isLoading ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Change Email Dialog ───────────────────────────────────────────────────────

function ChangeEmailDialog({ open, onOpenChange }: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  })

  const handleClose = (v: boolean) => { if (!v) reset(); onOpenChange(v) }

  const onSubmit = async (values: EmailValues) => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: values.email })
    if (error) { toast.error(error.message) }
    else { toast.success('Confirmation sent to your new address.'); handleClose(false) }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Change email</DialogTitle>
          <DialogDescription className="text-xs">
            A confirmation link will be sent before the change takes effect.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
          <FieldGroup>
            <Label htmlFor="new-email" className="text-xs text-muted-foreground">New email address</Label>
            <Input id="new-email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </FieldGroup>
          <Button type="submit" disabled={isLoading} className="mt-1">
            {isLoading ? 'Sending…' : 'Update email'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Delete Account Dialog ─────────────────────────────────────────────────────

function DeleteAccountDialog({ open, onOpenChange }: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const CONFIRM_PHRASE = 'delete my account'

  const handleClose = (v: boolean) => { if (!v) setConfirm(''); onOpenChange(v) }

  const handleDelete = async () => {
    if (confirm !== CONFIRM_PHRASE) return
    setIsLoading(true)
    const supabase = createClient()
    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json() as { error?: string }
      toast.error(data.error ?? 'Failed to delete account')
      setIsLoading(false)
      return
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription className="text-xs">
            Permanently removes your account and all resume data. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-xs text-muted-foreground">
            Type <span className="font-mono text-foreground">{CONFIRM_PHRASE}</span> to confirm.
          </p>
          <Input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={CONFIRM_PHRASE}
            aria-label="Confirm account deletion"
          />
          <Button
            variant="destructive"
            disabled={confirm !== CONFIRM_PHRASE || isLoading}
            onClick={handleDelete}
          >
            {isLoading ? 'Deleting…' : 'Delete account'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

interface AccountSettingsProps {
  userId: string
  email: string
  username: string
}

export function AccountSettings({ userId, email, username: initialUsername }: AccountSettingsProps) {
  const [dialog, setDialog] = useState<'username' | 'password' | 'email' | 'delete' | null>(null)
  const [username, setUsername] = useState(initialUsername)

  return (
    <>
      <div className="flex flex-col gap-1">
        <CopyLinkRow username={username} />
        <SettingsRow
          label="Change username"
          description={`Currently @${username}`}
          onClick={() => setDialog('username')}
        />
        <SettingsRow
          label="Change password"
          description="Update your login password"
          onClick={() => setDialog('password')}
        />
        <SettingsRow
          label="Change email"
          description="Update the email address on your account"
          onClick={() => setDialog('email')}
        />
        <SettingsRow
          label="Delete account"
          description="Permanently remove your account and data"
          onClick={() => setDialog('delete')}
          destructive
        />
      </div>

      <ChangeUsernameDialog
        open={dialog === 'username'}
        onOpenChange={(v) => setDialog(v ? 'username' : null)}
        userId={userId}
        currentUsername={username}
        onSuccess={setUsername}
      />
      <ChangePasswordDialog
        open={dialog === 'password'}
        onOpenChange={(v) => setDialog(v ? 'password' : null)}
        email={email}
      />
      <ChangeEmailDialog
        open={dialog === 'email'}
        onOpenChange={(v) => setDialog(v ? 'email' : null)}
      />
      <DeleteAccountDialog
        open={dialog === 'delete'}
        onOpenChange={(v) => setDialog(v ? 'delete' : null)}
      />
    </>
  )
}
