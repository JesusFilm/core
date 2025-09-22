import { z } from 'zod'

export const videoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  duration: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  fps: z.number().positive(),
  src: z.string().url(),
  poster: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string().min(1))
})

export const cropWindowSchema = z.object({
  focusX: z.number().min(0).max(1),
  focusY: z.number().min(0).max(1),
  scale: z.number().min(0.2).max(1.5)
})

export const cropKeyframeSchema = z.object({
  id: z.string().min(1),
  time: z.number().min(0),
  window: cropWindowSchema,
  easing: z.enum(['linear', 'ease-in', 'ease-out', 'ease-in-out']),
  locked: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const cropPathSchema = z.object({
  id: z.string().min(1),
  videoSlug: z.string().min(1),
  aspectRatio: z.number().positive(),
  padding: z.number().min(0).max(0.25),
  smoothing: z.number().min(0).max(1),
  keyframes: z.array(cropKeyframeSchema).min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const detectionResultSchema = z.object({
  id: z.string().min(1),
  time: z.number().min(0),
  box: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1)
  }),
  confidence: z.number().min(0).max(1),
  label: z.enum(['person', 'face', 'silhouette', 'center', 'object']),
  source: z.literal('mediapipe')
})

export const exportPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  fps: z.number().positive(),
  bitrate: z.number().positive(),
  format: z.enum(['mp4', 'webm'])
})

export const exportRequestSchema = z.object({
  presetId: z.string().min(1),
  path: cropPathSchema,
  targetFormat: z.enum(['mp4', 'webm']).optional()
})

export type VideoDTO = z.infer<typeof videoSchema>
export type CropWindowDTO = z.infer<typeof cropWindowSchema>
export type CropKeyframeDTO = z.infer<typeof cropKeyframeSchema>
export type CropPathDTO = z.infer<typeof cropPathSchema>
export type DetectionResultDTO = z.infer<typeof detectionResultSchema>
export type ExportPresetDTO = z.infer<typeof exportPresetSchema>
export type ExportRequestDTO = z.infer<typeof exportRequestSchema>
