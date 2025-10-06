import { z } from 'zod'

import { builder } from '../../builder'

const PlaylistCreateInputSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID').optional(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters'),
  note: z
    .string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
  noteSharedAt: z.date().optional(),
  sharedAt: z.date().optional(),
  slug: z
    .string()
    .min(5, 'Slug must be at least 5 characters long')
    .max(255, 'Slug must be less than 255 characters')
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      'Slug must contain only lowercase letters, numbers, and dashes. Dashes cannot be at the start or end.'
    )
    .optional()
})

export const PlaylistCreateInput = builder.inputType('PlaylistCreateInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string({ required: true }),
    note: t.string({ required: false }),
    noteSharedAt: t.field({ type: 'DateTime', required: false }),
    sharedAt: t.field({ type: 'DateTime', required: false }),
    slug: t.string({ required: false })
  }),
  validate: {
    schema: PlaylistCreateInputSchema
  }
})

export type PlaylistCreateInputShape = z.infer<typeof PlaylistCreateInputSchema>
