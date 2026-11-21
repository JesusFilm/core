import { z } from 'zod'

import { blockReference } from './structureContract'

const id = z.string().min(1).max(200)
const providerId = z.string().regex(/^[a-zA-Z0-9_-]{1,200}$/)
export const imageSource = z.discriminatedUnion('source', [
  z.object({ source: z.literal('library'), id }).strict(),
  z.object({ source: z.literal('history'), blockId: id }).strict(),
  z.object({ source: z.literal('unsplash'), id: providerId }).strict()
])
export const videoSource = z.discriminatedUnion('source', [
  z
    .object({ source: z.literal('internal'), videoId: id, languageId: id })
    .strict(),
  z
    .object({
      source: z.literal('youTube'),
      videoId: z.string().regex(/^[-\w]{11}$/)
    })
    .strict(),
  z.object({ source: z.literal('mux'), videoId: id }).strict()
])
export const mediaSlot = z.discriminatedUnion('slot', [
  z.object({ slot: z.literal('cover'), owner: blockReference }).strict(),
  z.object({ slot: z.literal('poster'), owner: blockReference }).strict(),
  z.object({ slot: z.literal('poll'), owner: blockReference }).strict(),
  z.object({ slot: z.literal('logo') }).strict(),
  z.object({ slot: z.literal('social') }).strict()
])
const videoSettings = z
  .object({
    objectFit: z.enum(['fill', 'fit', 'zoomed']).optional(),
    startAt: z.number().int().min(0).max(2147483647).optional(),
    endAt: z.number().int().min(0).max(2147483647).optional(),
    autoplay: z.boolean().optional(),
    muted: z.boolean().optional(),
    subtitleLanguageId: id.nullable().optional(),
    showGeneratedSubtitles: z.boolean().optional()
  })
  .strict()
const focal = z.number().int().min(0).max(100).nullable().optional()
export const mediaCommand = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('image_set'),
      block: blockReference,
      source: imageSource.optional(),
      alt: z.string().max(262144).optional(),
      scale: z
        .number()
        .int()
        .min(100)
        .max(200)
        .multipleOf(10)
        .nullable()
        .optional(),
      focalLeft: focal,
      focalTop: focal
    })
    .strict()
    .refine((value) => Object.keys(value).length > 2),
  z
    .object({ type: z.literal('image_source_clear'), block: blockReference })
    .strict(),
  z
    .object({
      type: z.literal('video_source_set'),
      block: blockReference,
      source: videoSource,
      settings: videoSettings.optional()
    })
    .strict(),
  z
    .object({
      type: z.literal('video_settings_set'),
      block: blockReference,
      ...videoSettings.shape
    })
    .strict()
    .refine((value) => Object.keys(value).length > 2),
  z
    .object({ type: z.literal('video_source_clear'), block: blockReference })
    .strict(),
  z
    .object({
      type: z.literal('media_slot_set'),
      target: mediaSlot,
      media: z.discriminatedUnion('kind', [
        z
          .object({
            kind: z.literal('image'),
            source: imageSource,
            alt: z.string().max(262144).optional()
          })
          .strict(),
        z
          .object({
            kind: z.literal('video'),
            source: videoSource,
            settings: videoSettings.optional()
          })
          .strict()
      ])
    })
    .strict()
    .refine(
      (value) => value.media.kind !== 'video' || value.target.slot === 'cover'
    ),
  z.object({ type: z.literal('media_slot_clear'), target: mediaSlot }).strict()
])
export type MediaCommand = z.infer<typeof mediaCommand>
export type ImageSource = z.infer<typeof imageSource>
export type VideoSettings = z.infer<typeof videoSettings>
export type VideoSource = z.infer<typeof videoSource>
export type MediaSlot = z.infer<typeof mediaSlot>
export const mediaCommandNames = mediaCommand.options.map(
  (option) => option.shape.type.value
)

const searchCommon = {
  journeyId: id,
  limit: z.number().int().min(1).max(50).default(20),
  cursor: z.string().max(4096).optional()
}
const query = z.string().max(200).optional()
export const mediaSearchInput = z.discriminatedUnion('source', [
  z
    .object({
      ...searchCommon,
      source: z.literal('library'),
      isAi: z.boolean().optional()
    })
    .strict(),
  z.object({ ...searchCommon, source: z.literal('history'), query }).strict(),
  z.object({ ...searchCommon, source: z.literal('unsplash'), query }).strict(),
  z
    .object({
      ...searchCommon,
      source: z.literal('internal'),
      query,
      videoId: id.optional()
    })
    .strict(),
  z
    .object({ ...searchCommon, source: z.literal('languages'), videoId: id })
    .strict(),
  z
    .object({
      ...searchCommon,
      source: z.literal('mux'),
      query,
      videoId: id.optional()
    })
    .strict(),
  z
    .object({
      ...searchCommon,
      source: z.literal('youTube'),
      videoId: z.string().regex(/^[-\w]{11}$/)
    })
    .strict()
])

export const readyImage = z
  .object({
    kind: z.literal('image'),
    src: z.string().url(),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    blurhash: z.string().min(1).max(500)
  })
  .strict()
export const readyVideo = z
  .object({
    kind: z.literal('video'),
    source: z.enum(['internal', 'youTube', 'mux']),
    videoId: id,
    videoVariantLanguageId: id.nullable(),
    title: z.string().max(262144).nullable(),
    description: z.string().max(262144).nullable(),
    image: z.string().url().nullable(),
    duration: z.number().int().min(3).max(2147483647),
    subtitleLanguageIds: z.array(id).max(10000),
    subtitleStatus: z.enum(['ready', 'unavailable']).default('ready')
  })
  .strict()
export type ReadyImage = z.infer<typeof readyImage>
export type ReadyVideo = z.infer<typeof readyVideo>
export type ReadyMedia = ReadyImage | ReadyVideo

export function mediaSourceKey(source: ImageSource | VideoSource): string {
  if (source.source === 'history') return `history:${source.blockId}`
  if (source.source === 'library' || source.source === 'unsplash')
    return `${source.source}:${source.id}`
  return `${source.source}:${source.videoId}:${source.source === 'internal' ? source.languageId : ''}`
}

const mediaFixtures: Record<MediaCommand['type'], MediaCommand> = {
  video_source_clear: { type: 'video_source_clear', block: { id: 'video' } },
  image_set: {
    type: 'image_set',
    block: { id: 'image' },
    focalLeft: 0,
    focalTop: 100,
    scale: null
  },
  image_source_clear: { type: 'image_source_clear', block: { id: 'image' } },
  video_source_set: {
    type: 'video_source_set',
    block: { id: 'video' },
    source: { source: 'internal', videoId: 'film', languageId: '529' }
  },
  video_settings_set: {
    type: 'video_settings_set',
    block: { id: 'video' },
    startAt: 0,
    endAt: 3,
    muted: false
  },
  media_slot_set: {
    type: 'media_slot_set',
    target: { slot: 'cover', owner: { id: 'card' } },
    media: { kind: 'image', source: { source: 'library', id: 'asset' } }
  },
  media_slot_clear: { type: 'media_slot_clear', target: { slot: 'social' } }
}
const mediaWrites: Record<MediaCommand['type'], readonly string[]> = {
  video_source_clear: [
    'source',
    'videoId',
    'videoVariantLanguageId',
    'title',
    'description',
    'image',
    'duration',
    'startAt',
    'endAt',
    'subtitleLanguageId',
    'showGeneratedSubtitles',
    'posterBlockId',
    'deletedAt'
  ],
  image_set: [
    'src',
    'width',
    'height',
    'blurhash',
    'alt',
    'scale',
    'focalLeft',
    'focalTop'
  ],
  image_source_clear: ['src', 'alt'],
  video_source_set: [
    'source',
    'videoId',
    'videoVariantLanguageId',
    'title',
    'description',
    'image',
    'duration',
    'startAt',
    'endAt',
    'subtitleLanguageId',
    'showGeneratedSubtitles',
    'autoplay',
    'muted',
    'objectFit'
  ],
  video_settings_set: [
    'objectFit',
    'startAt',
    'endAt',
    'autoplay',
    'muted',
    'subtitleLanguageId',
    'showGeneratedSubtitles'
  ],
  media_slot_set: [
    'src',
    'width',
    'height',
    'blurhash',
    'alt',
    'source',
    'videoId',
    'videoVariantLanguageId',
    'title',
    'description',
    'image',
    'duration',
    'startAt',
    'endAt',
    'objectFit',
    'autoplay',
    'muted',
    'subtitleLanguageId',
    'showGeneratedSubtitles',
    'created',
    'deletedAt',
    'coverBlockId',
    'posterBlockId',
    'pollOptionImageBlockId',
    'logoImageBlockId',
    'primaryImageBlockId'
  ],
  media_slot_clear: [
    'deletedAt',
    'coverBlockId',
    'posterBlockId',
    'pollOptionImageBlockId',
    'logoImageBlockId',
    'primaryImageBlockId'
  ]
}
/** Enabled rows have a real owning planner, source participant and inverses. */
export const mediaCommandRegistry = Object.fromEntries(
  mediaCommandNames.map((type) => [
    type,
    {
      schema: mediaCommand.options.find(
        (option) => option.shape.type.value === type
      )!,
      handler: 'media',
      requiredRole: 'journey:update',
      requiredGrant: 'journeys:edit',
      sourceChecks: [
        'ordinary-draft',
        'live-owned-target',
        'actual-slot-owner',
        'current-source-rights',
        'ready-source',
        'current-feature-flags',
        'source-specific-playback'
      ],
      dependencies: [
        'journey-revision',
        'authorization-generations',
        'media-source-generation',
        'source-state',
        'affected-field-history'
      ],
      writeSet: mediaWrites[type],
      preserved: [
        'unrequested-fields',
        'Host',
        'provider-assets',
        'public-file-delivery'
      ],
      effects: ['journey_content_changed'],
      inverseType: 'structure_restore',
      fixtures: {
        accepted: mediaFixtures[type],
        rejected: { ...mediaFixtures[type], hostId: 'excluded' }
      }
    }
  ])
)
