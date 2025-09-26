import { z } from 'zod'

import { builder } from '../../builder'

const PlaylistUpdateInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be less than 255 characters')
    .optional(),
  note: z
    .string()
    .max(1000, 'Note must be less than 1000 characters')
    .optional(),
  noteSharedAt: z.date().optional(),
  sharedAt: z.date().optional()
})

export const PlaylistUpdateInput = builder.inputType('PlaylistUpdateInput', {
  fields: (t) => ({
    name: t.string({ required: false }),
    note: t.string({ required: false }),
    noteSharedAt: t.field({ type: 'DateTime', required: false }),
    sharedAt: t.field({ type: 'DateTime', required: false })
  }),
  validate: {
    schema: PlaylistUpdateInputSchema
  }
})

export type PlaylistUpdateInputShape = z.infer<typeof PlaylistUpdateInputSchema>
