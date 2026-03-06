import { z } from 'zod'

// --- Video Subtitle Schema ---
export const videoSubtitleContentSchema = z.object({
  id: z.string().describe('The unique identifier for the subtitle.'),
  languageId: z.string().describe('The language ID of the subtitle.'),
  edition: z.string().describe('The edition of the video this subtitle belongs to.'),
  primary: z.boolean().describe('Whether this is the primary subtitle for the video.'),
  srtSrc: z.string().optional().describe('The SRT subtitle source URL.'),
  srtContent: z.string().optional().describe('The actual content of the SRT file when includeSrtContent is true.')
})

export type VideoSubtitleContent = z.infer<typeof videoSubtitleContentSchema>

// --- Video Subtitle Response Schema ---
export const videoSubtitleContentResponseSchema = z.object({
  success: z.boolean().describe('Whether the operation was successful.'),
  data: videoSubtitleContentSchema.optional().describe('The subtitle data if successful.'),
  errors: z.array(z.object({
    message: z.string().describe('Error message.')
  })).optional().describe('Array of error messages if the operation failed.')
})

export type VideoSubtitleContentResponse = z.infer<typeof videoSubtitleContentResponseSchema> 