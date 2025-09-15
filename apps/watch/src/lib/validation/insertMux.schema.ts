import { z } from 'zod'

import type { VideoInsertConfig } from '../../types/inserts'

const overlaySchema = z.object({
  label: z.string().min(1, 'overlay.label is required'),
  title: z.string().min(1, 'overlay.title is required'),
  collection: z.string().min(1, 'overlay.collection is required'),
  description: z.string().min(1, 'overlay.description is required')
})

const triggerSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sequence-start')
  }),
  z.object({
    type: z.literal('after-count'),
    count: z
      .number({ invalid_type_error: 'trigger.count must be a number' })
      .int('trigger.count must be an integer')
      .min(1, 'trigger.count must be at least 1')
  })
])

const muxInsertSchema = z
  .object({
    id: z.string().min(1, 'id is required'),
    enabled: z.boolean().default(true),
    source: z.literal('mux'),
    playbackIds: z
      .array(
        z
          .string()
          .min(1, 'playbackIds must contain non-empty strings'),
        { required_error: 'playbackIds are required' }
      )
      .min(1, 'playbackIds must include at least one ID'),
    overlay: overlaySchema,
    trigger: triggerSchema,
    posterOverride: z.string().min(1).optional()
  })
  .strict()

export const insertMuxSchema = z
  .object({
    version: z.string().min(1, 'version is required'),
    inserts: z.array(muxInsertSchema)
  })
  .transform((config) => config satisfies VideoInsertConfig)

export function parseInsertMuxConfig(input: unknown): VideoInsertConfig {
  return insertMuxSchema.parse(input)
}
