import { z } from 'zod'

export const blockVideoSourceEnum = z.enum([
  'cloudflare',
  'internal',
  'mux',
  'youTube'
])

export const blockVideoObjectFitEnum = z.enum(['fill', 'fit', 'zoomed'])

export const blockVideoUpdateInputSchema = z.object({
  startAt: z
    .number()
    .nullable()
    .optional()
    .describe('Point of time the video should start playing'),
  endAt: z
    .number()
    .nullable()
    .optional()
    .describe('Point of time the video should end'),
  muted: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video is muted'),
  autoplay: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video autoplays'),
  duration: z
    .number()
    .nullable()
    .optional()
    .describe('Duration of the video in seconds'),
  videoId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the video to display'),
  videoVariantLanguageId: z
    .string()
    .nullable()
    .optional()
    .describe('Language ID for internal videos'),
  source: blockVideoSourceEnum
    .nullable()
    .optional()
    .describe('Source of the video (internal, youTube, etc.)'),
  posterBlockId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of an ImageBlock to use as poster'),
  fullsize: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video should be displayed fullsize'),
  objectFit: blockVideoObjectFitEnum
    .nullable()
    .optional()
    .describe('How the video should fit within its container')
})

export const blockVideoUpdateSchema = z.object({
  __typename: z.literal('VideoBlock'),
  id: z.string(),
  parentBlockId: z.string().nullable(),
  parentOrder: z.number().nullable(),
  muted: z.boolean().nullable().describe('Whether the video is muted'),
  autoplay: z.boolean().nullable().describe('Whether the video autoplays'),
  startAt: z
    .number()
    .nullable()
    .describe('Point of time the video should start playing'),
  endAt: z.number().nullable().describe('Point of time the video should end'),
  posterBlockId: z
    .string()
    .nullable()
    .describe(
      'ID of an ImageBlock to use as poster. Should not be rendered normally'
    ),
  fullsize: z.boolean().nullable().describe('Whether the video is fullsize'),
  videoId: z
    .string()
    .nullable()
    .describe('ID of the video. Required for all sources'),
  videoVariantLanguageId: z
    .string()
    .nullable()
    .describe('Language ID for internal videos only'),
  source: blockVideoSourceEnum.describe(
    'Source of the video (internal, youTube, etc.)'
  ),
  title: z
    .string()
    .nullable()
    .describe('Title of the video (auto-populated for non-internal sources)'),
  description: z
    .string()
    .nullable()
    .describe(
      'Description of the video (auto-populated for non-internal sources)'
    ),
  image: z
    .string()
    .nullable()
    .describe(
      'Image URL for the video (auto-populated for non-internal sources)'
    ),
  duration: z
    .number()
    .nullable()
    .describe('Duration in seconds (auto-populated for non-internal sources)'),
  objectFit: blockVideoObjectFitEnum
    .nullable()
    .describe('How the video should display within the VideoBlock'),
  mediaVideo: z.any().nullable().describe('Media video details'),
  action: z.any().nullable().describe('Action to perform when the video ends')
})
