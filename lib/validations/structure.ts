import { z } from 'zod'

export const sectionKeySchema = z.enum([
  'basics',
  'work',
  'volunteer',
  'education',
  'awards',
  'certificates',
  'publications',
  'skills',
  'languages',
  'interests',
  'references',
  'projects',
])

export const sectionConfigSchema = z.object({
  key: sectionKeySchema,
  visible: z.boolean(),
})

export const resumeStructureSchema = z.object({
  sections: z.array(sectionConfigSchema),
  layout: z.object({
    columns: z.union([z.literal(1), z.literal(2)]),
  }),
})
