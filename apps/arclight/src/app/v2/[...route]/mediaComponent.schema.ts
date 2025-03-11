import { z } from '@hono/zod-openapi'

export const mediaComponentSchema = z.object({
  mediaComponentId: z.string(),
  componentType: z.string(),
  subType: z.string(),
  contentType: z.string(),
  imageUrls: z.object({
    thumbnail: z.string(),
    videoStill: z.string(),
    mobileCinematicHigh: z.string(),
    mobileCinematicLow: z.string(),
    mobileCinematicVeryLow: z.string()
  }),
  lengthInMilliseconds: z.number(),
  containsCount: z.number(),
  isDownloadable: z.boolean(),
  downloadSizes: z.object({
    approximateSmallDownloadSizeInBytes: z.number(),
    approximateLargeDownloadSizeInBytes: z.number()
  }),
  bibleCitations: z.array(
    z.object({
      osisBibleBook: z.string(),
      chapterStart: z.number(),
      verseStart: z.number(),
      chapterEnd: z.number(),
      verseEnd: z.number()
    })
  ),
  primaryLanguageId: z.number(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string(),
  studyQuestions: z.array(z.string()),
  metadataLanguageTag: z.string()
})
