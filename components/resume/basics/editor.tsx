'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useResume } from '@/components/providers/resume-provider'
import { basicsSchema } from '@/lib/validations/resume'
import { RichTextEditor } from '../rich-text/editor'
import type { z } from 'zod'

type BasicsFormValues = z.infer<typeof basicsSchema>

function BareInput({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`bg-transparent border-none outline-none placeholder:text-muted-foreground/30 ${className}`}
      {...props}
    />
  )
}

export function BasicsEditor() {
  const { content, dispatch } = useResume()

  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<BasicsFormValues>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      name: content.basics.name,
      label: content.basics.label ?? '',
      email: content.basics.email,
      phone: content.basics.phone ?? '',
      url: content.basics.url ?? '',
      summary: content.basics.summary,
    },
  })

  const values = watch()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    dispatch({ type: 'UPDATE_BASICS', payload: values })
  }, [JSON.stringify(values)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-2.5">
      {/* Name — matches h1 in view */}
      <BareInput
        id="basics-name"
        className="w-full text-[1.5em] font-semibold leading-tight"
        placeholder="Your Name"
        {...register('name')}
      />
      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}

      {/* Label — matches muted subtitle in view */}
      <BareInput
        id="basics-label"
        className="w-full text-muted-foreground"
        placeholder="Title or role…"
        {...register('label')}
      />

      {/* Contact row — inline, matches view layout */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-muted-foreground mt-0.5">
        <BareInput
          id="basics-email"
          type="email"
          className="min-w-0"
          placeholder="email"
          {...register('email')}
        />
        <BareInput
          id="basics-phone"
          type="tel"
          className="min-w-0"
          placeholder="phone"
          {...register('phone')}
        />
        <BareInput
          id="basics-url"
          type="url"
          className="min-w-0"
          placeholder="website"
          {...register('url')}
        />
      </div>
      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}

      {/* Summary */}
      <div className="mt-2 text-muted-foreground">
        <Controller
          control={control}
          name="summary"
          render={({ field }) => (
            <RichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              id="basics-summary"
              placeholder="Write a short professional summary…"
            />
          )}
        />
      </div>
    </div>
  )
}
