import { z } from 'zod'

import {
  BlockFields_VideoBlock,
  BlockFields_VideoBlock_mediaVideo
} from '../../../../../../__generated__/BlockFields'
import {
  VideoBlockCreateInput,
  VideoBlockObjectFit,
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { actionSchema } from '../action/type'

export const blockVideoSourceEnum = z
  .nativeEnum(VideoBlockSource)
  .describe('Source of the video (internal, youTube, etc.)')

export const blockVideoObjectFitEnum = z
  .nativeEnum(VideoBlockObjectFit)
  .describe('How the video should fit within its container')

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
}) satisfies z.ZodType<VideoBlockUpdateInput>

const videoTitleSchema = z.object({
  __typename: z.literal('VideoTitle'),
  value: z.string().describe('Title of the video')
})

const videoImagesSchema = z.object({
  __typename: z.literal('CloudflareImage'),
  mobileCinematicHigh: z.string().nullable()
})

const videoVariantSchema = z.object({
  __typename: z.literal('VideoVariant'),
  id: z.string().describe('ID of the video variant'),
  hls: z.string().nullable().describe('HLS URL of the video variant')
})

const languageNameSchema = z.object({
  __typename: z.literal('LanguageName'),
  value: z.string().describe('Name of the language'),
  primary: z
    .boolean()
    .describe('whether this value is translated or the source name')
})

const languageSchema = z.object({
  __typename: z.literal('Language'),
  id: z.string().describe('ID of the language'),
  name: z.array(languageNameSchema)
})

const mediaVideoVideoSchema = z.object({
  __typename: z.literal('Video'),
  id: z.string(),
  title: z.array(videoTitleSchema),
  images: z.array(videoImagesSchema),
  variant: videoVariantSchema.nullable(),
  variantLanguages: z.array(languageSchema)
})

const mediaVideoMuxVideoSchema = z.object({
  __typename: z.literal('MuxVideo'),
  id: z.string(),
  assetId: z.string().nullable().describe('ID of the Mux video asset'),
  playbackId: z.string().nullable().describe('ID of the Mux video playback')
})

const mediaVideoYouTubeSchema = z.object({
  __typename: z.literal('YouTube'),
  id: z.string().describe('ID of the YouTube video')
})

const mediaVideoSchema = z.union([
  mediaVideoVideoSchema,
  mediaVideoMuxVideoSchema,
  mediaVideoYouTubeSchema
]) satisfies z.ZodType<BlockFields_VideoBlock_mediaVideo>

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
  action: actionSchema
    .nullable()
    .describe('Action to perform when the video ends'),
  mediaVideo: mediaVideoSchema
    .nullable()
    .describe('Media video associated with the video block')
}) satisfies z.ZodType<BlockFields_VideoBlock>

export const blockVideoCreateInputSchema = z.object({
  id: z
    .string()
    .nullable()
    .optional()
    .describe('Unique identifier for the block'),
  journeyId: z.string().describe('ID of the journey this block belongs to'),
  parentBlockId: z.string().describe('ID of the parent block'),
  startAt: z
    .number()
    .nullable()
    .optional()
    .describe('The start time of the video in seconds'),
  endAt: z
    .number()
    .nullable()
    .optional()
    .describe('The end time of the video in seconds'),
  duration: z
    .number()
    .nullable()
    .optional()
    .describe('The duration of the video in seconds'),
  description: z
    .string()
    .nullable()
    .optional()
    .describe('Description of the video'),
  muted: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video should be muted by default'),
  autoplay: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video should autoplay'),
  videoId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the video from the video service'),
  videoVariantLanguageId: z
    .string()
    .nullable()
    .optional()
    .describe('Language variant ID for the video'),
  source: blockVideoSourceEnum
    .nullable()
    .optional()
    .describe('Source of the video (internal, youTube, etc.)'),
  posterBlockId: z
    .string()
    .nullable()
    .optional()
    .describe('ID of the poster image block'),
  fullsize: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether the video should display in full size'),
  isCover: z
    .boolean()
    .nullable()
    .optional()
    .describe('Whether this video is used as a cover'),
  objectFit: blockVideoObjectFitEnum
    .nullable()
    .optional()
    .describe('How the video should fit within its container')
}) satisfies z.ZodType<VideoBlockCreateInput>
