import { z } from 'zod'

export const imageByteLimit = 10_000_000
export const uploadChunkBytes = 1_048_576
export const transferLifetimeMs = 3_600_000
export const mediaFile = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      .regex(/^[^/\\\u0000-\u001f]+\.(png|jpe?g|webp|gif)$/i),
    mime: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/gif']),
    size: z.number().int().positive().max(imageByteLimit),
    sha256: z.string().regex(/^[a-f0-9]{64}$/)
  })
  .strict()
const journeyId = z.string().min(1).max(200)
export const mediaStartInput = z
  .object({
    journeyId,
    idempotencyKey: z.string().min(1).max(200),
    kind: z.literal('image_upload'),
    file: mediaFile.optional()
  })
  .strict()
export const mediaJobInput = z
  .object({ journeyId, jobId: z.string().uuid() })
  .strict()
export const mediaCancelInput = mediaJobInput
  .extend({ idempotencyKey: z.string().min(1).max(200) })
  .strict()
export const mediaJobState = z.enum([
  'waiting_for_file',
  'transferring',
  'validating',
  'dispatch_pending',
  'processing',
  'reconciling',
  'ready',
  'cancel_requested',
  'cancelled',
  'failed',
  'transfer_expired'
])
export type MediaFile = z.infer<typeof mediaFile>
export const mediaJobTools = [
  'journey_media_start',
  'journey_media_status',
  'journey_media_cancel'
] as const
