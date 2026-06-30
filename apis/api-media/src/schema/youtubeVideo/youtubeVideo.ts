import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'
import { Video } from '../video/video'

import { assertYoutubeVideoInvariant } from './service'

export const YoutubeReviewState = builder.enumType('YoutubeReviewState', {
  values: ['LINKED', 'DISMISSED', 'SKIPPED'] as const
})

export const YoutubeReasonCode = builder.enumType('YoutubeReasonCode', {
  values: ['NO_CATALOG_MATCH', 'NOT_APPLICABLE'] as const
})

interface YoutubeVideoPlaylistShape {
  playlistId: string
  title: string
}

const YoutubeVideoPlaylist = builder
  .objectRef<YoutubeVideoPlaylistShape>('YoutubeVideoPlaylist')
  .implement({
    description:
      'A snapshot of a playlist a YouTube video belongs to. Non-authoritative; never a match signal.',
    fields: (t) => ({
      playlistId: t.exposeString('playlistId', { nullable: false }),
      title: t.exposeString('title', { nullable: false })
    })
  })

function parsePlaylists(
  value: Prisma.JsonValue | null
): YoutubeVideoPlaylistShape[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((entry) => {
    if (
      entry != null &&
      typeof entry === 'object' &&
      !Array.isArray(entry) &&
      typeof entry.playlistId === 'string' &&
      typeof entry.title === 'string'
    ) {
      return [{ playlistId: entry.playlistId, title: entry.title }]
    }
    return []
  })
}

export const YoutubeVideo = builder.prismaObject('YoutubeVideo', {
  description:
    'A YouTube video an operator has seen, mirrored into Core. Absence of a row means "not yet seen"; a row count is NOT a channel video count.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    youtubeVideoId: t.exposeString('youtubeVideoId', { nullable: false }),
    channelId: t.exposeID('channelId', { nullable: false }),
    reviewState: t.expose('reviewState', {
      type: YoutubeReviewState,
      nullable: false
    }),
    videoId: t.exposeID('videoId'),
    languageId: t.exposeID('languageId'),
    variant: t.relation('variant', {
      nullable: true,
      description: 'The catalog variant a LINKED row resolves to.'
    }),
    video: t.field({
      type: Video,
      nullable: true,
      description: 'The catalog Video a LINKED row resolves to.',
      resolve: ({ videoId }) =>
        videoId == null
          ? null
          : prisma.video.findUnique({ where: { id: videoId } })
    }),
    language: t.field({
      type: Language,
      nullable: true,
      resolve: ({ languageId }) => (languageId == null ? null : { id: languageId })
    }),
    reasonCode: t.expose('reasonCode', {
      type: YoutubeReasonCode,
      nullable: true
    }),
    reasonNote: t.exposeString('reasonNote'),
    youtubeTitle: t.exposeString('youtubeTitle'),
    youtubeDescription: t.exposeString('youtubeDescription'),
    tags: t.exposeStringList('tags', { nullable: false }),
    thumbnailUrl: t.exposeString('thumbnailUrl'),
    playlists: t.field({
      type: [YoutubeVideoPlaylist],
      nullable: false,
      resolve: ({ playlists }) => parsePlaylists(playlists)
    }),
    madeForKids: t.exposeBoolean('madeForKids'),
    ageRestricted: t.exposeBoolean('ageRestricted'),
    fileName: t.exposeString('fileName'),
    privacyStatus: t.exposeString('privacyStatus'),
    publishedAt: t.expose('publishedAt', { type: 'DateTime', nullable: true }),
    reviewedBy: t.exposeString('reviewedBy'),
    reviewedAt: t.expose('reviewedAt', { type: 'DateTime', nullable: true }),
    matchMethod: t.exposeString('matchMethod'),
    matchConfidence: t.exposeFloat('matchConfidence'),
    lastSyncedAt: t.expose('lastSyncedAt', {
      type: 'DateTime',
      nullable: true
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false })
  })
})

const YoutubeVideoPlaylistInput = builder.inputType('YoutubeVideoPlaylistInput', {
  fields: (t) => ({
    playlistId: t.string({ required: true }),
    title: t.string({ required: true })
  })
})

const YoutubeVideoUpsertInput = builder.inputType('YoutubeVideoUpsertInput', {
  fields: (t) => ({
    youtubeVideoId: t.id({ required: true }),
    channelId: t.id({ required: true }),
    reviewState: t.field({ type: YoutubeReviewState, required: true }),
    videoId: t.id({ required: false }),
    languageId: t.id({ required: false }),
    reasonCode: t.field({ type: YoutubeReasonCode, required: false }),
    reasonNote: t.string({ required: false }),
    youtubeTitle: t.string({ required: false }),
    youtubeDescription: t.string({ required: false }),
    tags: t.stringList({ required: false }),
    thumbnailUrl: t.string({ required: false }),
    playlists: t.field({
      type: [YoutubeVideoPlaylistInput],
      required: false
    }),
    madeForKids: t.boolean({ required: false }),
    ageRestricted: t.boolean({ required: false }),
    fileName: t.string({ required: false }),
    privacyStatus: t.string({ required: false }),
    publishedAt: t.field({ type: 'DateTime', required: false }),
    matchMethod: t.string({ required: false }),
    matchConfidence: t.float({ required: false })
  })
})

builder.queryFields((t) => ({
  youtubeVideos: t.withAuth({ isPublisher: true }).prismaField({
    type: ['YoutubeVideo'],
    nullable: false,
    description: "List a channel's YoutubeVideo rows (the resume-diff source).",
    args: {
      channelId: t.arg.id({ required: true }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { channelId, offset, limit }) =>
      await prisma.youtubeVideo.findMany({
        ...query,
        where: { channelId },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
  }),
  youtubeVideoByVideoId: t.withAuth({ isPublisher: true }).prismaField({
    type: 'YoutubeVideo',
    nullable: true,
    description: 'Look up a single row by its youtubeVideoId.',
    args: {
      youtubeVideoId: t.arg.id({ required: true })
    },
    resolve: async (query, _root, { youtubeVideoId }) =>
      await prisma.youtubeVideo.findUnique({
        ...query,
        where: { youtubeVideoId }
      })
  })
}))

builder.mutationFields((t) => ({
  youtubeVideoUpsert: t.withAuth({ isPublisher: true }).prismaField({
    type: 'YoutubeVideo',
    nullable: false,
    description:
      'Create-or-update a YoutubeVideo by youtubeVideoId. Idempotent; enforces the status invariant.',
    args: {
      input: t.arg({ type: YoutubeVideoUpsertInput, required: true })
    },
    resolve: async (query, _root, { input }, { user }) => {
      await assertYoutubeVideoInvariant(input.reviewState, {
        videoId: input.videoId,
        languageId: input.languageId
      })

      const now = new Date()
      const playlists =
        input.playlists == null
          ? Prisma.DbNull
          : (input.playlists as Prisma.InputJsonValue)

      const facts = {
        channelId: input.channelId,
        reviewState: input.reviewState,
        videoId: input.videoId ?? null,
        languageId: input.languageId ?? null,
        reasonCode: input.reasonCode ?? null,
        reasonNote: input.reasonNote ?? null,
        youtubeTitle: input.youtubeTitle ?? null,
        youtubeDescription: input.youtubeDescription ?? null,
        tags: input.tags ?? [],
        thumbnailUrl: input.thumbnailUrl ?? null,
        playlists,
        madeForKids: input.madeForKids ?? null,
        ageRestricted: input.ageRestricted ?? null,
        fileName: input.fileName ?? null,
        privacyStatus: input.privacyStatus ?? null,
        publishedAt: input.publishedAt ?? null,
        matchMethod: input.matchMethod ?? null,
        matchConfidence: input.matchConfidence ?? null,
        reviewedBy: user.id,
        reviewedAt: now,
        lastSyncedAt: now
      }

      return await prisma.youtubeVideo.upsert({
        ...query,
        where: { youtubeVideoId: input.youtubeVideoId },
        create: { youtubeVideoId: input.youtubeVideoId, ...facts },
        update: facts
      })
    }
  }),
  youtubeVideoDelete: t.withAuth({ isPublisher: true }).field({
    type: 'Boolean',
    nullable: false,
    description: 'Remove a YoutubeVideo row.',
    args: {
      youtubeVideoId: t.arg.id({ required: true })
    },
    resolve: async (_root, { youtubeVideoId }) => {
      try {
        await prisma.youtubeVideo.delete({ where: { youtubeVideoId } })
        return true
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new GraphQLError('YoutubeVideo not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        throw error
      }
    }
  })
}))
