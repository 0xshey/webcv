import { z } from 'zod'

const dateField = z
  .string()
  .regex(
    /^\d{4}-\d{2}(-\d{2})?$/,
    'Date must be in YYYY-MM or YYYY-MM-DD format'
  )
  .optional()
  .or(z.literal(''))

const urlField = z
  .string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))

export const basicsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  label: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  url: urlField,
  summary: z.string().optional(),
})

export const workItemSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  url: urlField,
  startDate: dateField,
  endDate: dateField,
  summary: z.string().optional(),
})

export const educationItemSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  url: urlField,
  area: z.string().min(1, 'Field of study is required'),
  studyType: z.string().min(1, 'Degree type is required'),
  startDate: dateField,
  endDate: dateField,
  score: z.string().optional(),
})

export const skillItemSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  level: z.string().optional(),
  keywords: z.string().optional(), // comma-separated in form
})

export const projectItemSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  url: urlField,
  startDate: dateField,
  endDate: dateField,
})

export const volunteerItemSchema = z.object({
  organization: z.string().min(1, 'Organization is required'),
  position: z.string().min(1, 'Position is required'),
  url: urlField,
  startDate: dateField,
  endDate: dateField,
  summary: z.string().optional(),
})

export const awardItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: dateField,
  awarder: z.string().min(1, 'Awarder is required'),
  summary: z.string().optional(),
})

export const publicationItemSchema = z.object({
  name: z.string().min(1, 'Publication name is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  releaseDate: dateField,
  url: urlField,
  summary: z.string().optional(),
})

export const languageItemSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  fluency: z.string().min(1, 'Fluency is required'),
})

export const interestItemSchema = z.object({
  name: z.string().min(1, 'Interest name is required'),
  keywords: z.string().optional(), // comma-separated in form
})

export const referenceItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  reference: z.string().min(1, 'Reference text is required'),
})

export const certificateItemSchema = z.object({
  name: z.string().min(1, 'Certificate name is required'),
  date: dateField,
  issuer: z.string().min(1, 'Issuer is required'),
  url: urlField,
})
