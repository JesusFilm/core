import { z } from 'zod'

export const imageByteLimit = 10_000_000
export const videoByteLimit = 1_000_000_000
export const uploadChunkBytes = 1_048_576
export const transferLifetimeMs = 3_600_000
export const mediaFile = z
  .object({
    name: z
      .string()
      .min(1)
      .max(255)
      // eslint-disable-next-line no-control-regex -- Upload filenames must reject ASCII control characters.
      .regex(/^[^/\\\u0000-\u001f]+\.(png|jpe?g|webp|gif|mp4|mov)$/i),
    mime: z.enum([
      'image/png',
      'image/jpeg',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime'
    ]),
    size: z.number().int().positive().max(videoByteLimit),
    sha256: z.string().regex(/^[a-f0-9]{64}$/)
  })
  .strict()
  .refine((file) => {
    const extension = file.name.split('.').pop()!.toLowerCase()
    const extensions: Record<string, string[]> = {
      'image/png': ['png'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/webp': ['webp'],
      'image/gif': ['gif'],
      'video/mp4': ['mp4'],
      'video/quicktime': ['mov']
    }
    return (
      (file.mime.startsWith('video/')
        ? extensions[file.mime].includes(extension)
        : ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) &&
      (file.mime.startsWith('video/') || file.size <= imageByteLimit)
    )
  })
export function fileMatchesKind(file: MediaFile, kind: string): boolean {
  return file.mime.startsWith(kind === 'video_upload' ? 'video/' : 'image/')
}
const journeyId = z.string().min(1).max(200)
const uploadInput = z
  .object({
    journeyId,
    idempotencyKey: z.string().min(1).max(200),
    kind: z.enum(['image_upload', 'video_upload']),
    file: mediaFile.optional()
  })
  .strict()
  .refine((input) => !input.file || fileMatchesKind(input.file, input.kind))
export const imageGenerationInput = z
  .object({
    journeyId,
    idempotencyKey: z.string().min(1).max(200),
    kind: z.literal('image_generation'),
    prompt: z
      .string()
      .min(1)
      .max(2048)
      .refine((value) => value.trim().length > 0)
  })
  .strict()
export const mediaStartInput = z.discriminatedUnion('kind', [
  uploadInput,
  imageGenerationInput
])
export type MediaStart = z.infer<typeof mediaStartInput>
export const generationWindowMs = 24 * 60 * 60 * 1000
export const generationDispatchLimit = 10
export const mediaJobInput = z
  .object({
    journeyId,
    jobId: z.string().uuid(),
    resume: z.boolean().optional()
  })
  .strict()
export const mediaCancelInput = mediaJobInput
  .omit({ resume: true })
  .extend({ idempotencyKey: z.string().min(1).max(200) })
  .strict()
export const mediaJobState = z.enum([
  'waiting_for_file',
  'transferring',
  'validating',
  'dispatch_pending',
  'provider_allocated',
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

export type MediaJobState = z.infer<typeof mediaJobState>
