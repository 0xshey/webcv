'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useResume } from '@/components/providers/resume-provider'
import { basicsSchema } from '@/lib/validations/resume'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RichTextEditor } from './rich-text-editor'
import type { z } from 'zod'

type BasicsFormValues = z.infer<typeof basicsSchema>

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

  useEffect(() => {
    dispatch({ type: 'UPDATE_BASICS', payload: values })
  }, [JSON.stringify(values)]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="basics-name">Full Name</Label>
          <Input id="basics-name" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="basics-label">Title / Label</Label>
          <Input id="basics-label" placeholder="e.g. Software Engineer" {...register('label')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="basics-email">Email</Label>
          <Input id="basics-email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="basics-phone">Phone</Label>
          <Input id="basics-phone" type="tel" {...register('phone')} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="basics-url">Website</Label>
        <Input id="basics-url" type="url" placeholder="https://..." {...register('url')} />
        {errors.url && <p className="text-xs text-red-500">{errors.url.message}</p>}
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="basics-summary">Summary</Label>
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
