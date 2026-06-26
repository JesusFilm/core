import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/media/client'

import { DateTimeFilter, builder, toPrismaDateTimeFilter } from '../builder'
import { MaxResolutionTier } from '../mux/video/enums'

import { createMuxVideoForUpload, resumeVideoVariantUpload } from './service'

export const VideoVariantUploadStatus = builder.enumType(
  'VideoVariantUploadStatus',
  {
    values: [
      'created',
      'r2Prepared',
      'r2Uploaded',
      'muxCreated',
      'muxReady',
      'variantCreated',
      'failed'
    ] as const
  }
)

const VideoVariantUploadStartInput = builder.inputType(
  'VideoVariantUploadStartInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      source: t.string({ required: true }),
      sourceKey: t.string({ required: false }),
      videoId: t.id({ required: true }),
      edition: t.string({ required: true }),
      languageId: t.id({ required: true }),
      version: t.int({ required: true }),
      published: t.boolean({ required: false }),
      originalFilename: t.string({ required: false }),
      contentType: t.string({ required: false }),
      contentLength: t.field({ type: 'BigInt', required: false }),
      duration: t.int({ required: false }),
      durationMs: t.int({ required: false }),
      width: t.int({ required: false }),
      height: t.int({ required: false }),
      r2AssetId: t.id({ required: false })
    })
  }
)

const VideoVariantUploadsFilter = builder.inputType(
  'VideoVariantUploadsFilter',
  {
    fields: (t) => ({
      status: t.field({ type: VideoVariantUploadStatus, required: false }),
      statuses: t.field({
        type: [VideoVariantUploadStatus],
        required: false
      }),
      videoId: t.id({ required: false }),
      languageId: t.id({ required: false }),
      edition: t.string({ required: false }),
      createdAt: t.field({ type: DateTimeFilter, required: false }),
      updatedAt: t.field({ type: DateTimeFilter, required: false })
    })
  }
)

export const VideoVariantUpload = builder.prismaObject('VideoVariantUpload', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    source: t.exposeString('source', { nullable: false }),
    sourceKey: t.exposeString('sourceKey'),
    status: t.expose('status', {
      type: VideoVariantUploadStatus,
      nullable: false
    }),
    videoId: t.exposeID('videoId', { nullable: false }),
    edition: t.exposeString('edition', { nullable: false }),
    languageId: t.exposeID('languageId', { nullable: false }),
    version: t.exposeInt('version', { nullable: false }),
    published: t.exposeBoolean('published', { nullable: false }),
    originalFilename: t.exposeString('originalFilename'),
    contentType: t.exposeString('contentType'),
    contentLength: t.field({
      type: 'BigInt',
      nullable: true,
      resolve: (parent) =>
        parent.contentLength == null ? null : BigInt(parent.contentLength)
    }),
    duration: t.exposeInt('duration'),
    durationMs: t.exposeInt('durationMs'),
    width: t.exposeInt('width'),
    height: t.exposeInt('height'),
    r2AssetId: t.exposeID('r2AssetId'),
    muxVideoId: t.exposeID('muxVideoId'),
    muxNonStandardInputDetectedAt: t.expose('muxNonStandardInputDetectedAt', {
      type: 'DateTime',
      nullable: true
    }),
    videoVariantId: t.exposeID('videoVariantId'),
    errorMessage: t.exposeString('errorMessage'),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    r2Asset: t.relation('r2Asset'),
    muxVideo: t.relation('muxVideo'),
    videoVariant: t.relation('videoVariant')
  })
})

builder.queryFields((t) => ({
  videoVariantUpload: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantUpload',
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _root, { id }) => {
      return await prisma.videoVariantUpload.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  }),
  videoVariantUploads: t.withAuth({ isPublisher: true }).prismaField({
    type: ['VideoVariantUpload'],
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantUploadsFilter, required: false }),
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { input, offset, limit }) => {
      return await prisma.videoVariantUpload.findMany({
        ...query,
        where: {
          status:
            input?.statuses != null && input.status != null
              ? { in: [input.status, ...input.statuses] }
              : input?.statuses != null
                ? { in: input.statuses }
                : (input?.status ?? undefined),
          videoId: input?.videoId ?? undefined,
          languageId: input?.languageId ?? undefined,
          edition: input?.edition ?? undefined,
          createdAt: toPrismaDateTimeFilter(input?.createdAt),
          updatedAt: toPrismaDateTimeFilter(input?.updatedAt)
        },
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: offset ?? undefined,
        take: limit ?? undefined
      })
    }
  })
}))

builder.mutationFields((t) => ({
  videoVariantUploadStart: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantUpload',
    nullable: false,
    args: {
      input: t.arg({ type: VideoVariantUploadStartInput, required: true })
    },
    resolve: async (query, _root, { input }) => {
      return await prisma.videoVariantUpload.create({
        ...query,
        data: {
          id: input.id ?? undefined,
          source: input.source,
          sourceKey: input.sourceKey,
          videoId: input.videoId,
          edition: input.edition,
          languageId: input.languageId,
          version: input.version,
          published: input.published ?? true,
          originalFilename: input.originalFilename,
          contentType: input.contentType,
          contentLength: input.contentLength,
          duration: input.duration,
          durationMs: input.durationMs,
          width: input.width,
          height: input.height,
          r2AssetId: input.r2AssetId,
          status: input.r2AssetId == null ? 'created' : 'r2Prepared'
        }
      })
    }
  }),
  videoVariantUploadMarkR2Prepared: t
    .withAuth({ isPublisher: true })
    .prismaField({
      type: 'VideoVariantUpload',
      nullable: false,
      args: {
        id: t.arg.id({ required: true }),
        r2AssetId: t.arg.id({ required: true })
      },
      resolve: async (query, _root, { id, r2AssetId }) => {
        return await prisma.videoVariantUpload.update({
          ...query,
          where: { id },
          data: {
            r2AssetId,
            status: 'r2Prepared',
            errorMessage: null
          }
        })
      }
    }),
  videoVariantUploadMarkR2Complete: t
    .withAuth({ isPublisher: true })
    .prismaField({
      type: 'VideoVariantUpload',
      nullable: false,
      args: {
        id: t.arg.id({ required: true })
      },
      resolve: async (query, _root, { id }) => {
        const upload = await prisma.videoVariantUpload.findUnique({
          where: { id },
          include: { r2Asset: true }
        })

        if (upload == null) {
          throw new GraphQLError('Video variant upload not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }
        if (upload.r2AssetId == null || upload.r2Asset?.publicUrl == null) {
          throw new Error('Upload has no linked R2 asset public URL')
        }

        return await prisma.videoVariantUpload.update({
          ...query,
          where: { id },
          data: {
            status: 'r2Uploaded',
            errorMessage: null
          }
        })
      }
    }),
  videoVariantUploadCreateMux: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantUpload',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      muxVideoId: t.arg.id({ required: false }),
      downloadable: t.arg.boolean({ required: false, defaultValue: true }),
      maxResolution: t.arg({
        type: MaxResolutionTier,
        required: false,
        defaultValue: 'uhd'
      })
    },
    resolve: async (
      query,
      _root,
      { id, muxVideoId, downloadable, maxResolution },
      { user }
    ) => {
      if (user == null) throw new Error('User not found')
      await createMuxVideoForUpload({
        uploadId: id,
        userId: user.id,
        muxVideoId,
        downloadable,
        maxResolution
      })
      return await prisma.videoVariantUpload.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  }),
  videoVariantUploadResume: t.withAuth({ isPublisher: true }).prismaField({
    type: 'VideoVariantUpload',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      downloadable: t.arg.boolean({ required: false, defaultValue: true }),
      maxResolution: t.arg({
        type: MaxResolutionTier,
        required: false,
        defaultValue: 'uhd'
      })
    },
    resolve: async (
      query,
      _root,
      { id, downloadable, maxResolution },
      { user }
    ) => {
      if (user == null) throw new Error('User not found')
      await resumeVideoVariantUpload({
        uploadId: id,
        userId: user.id,
        downloadable,
        maxResolution
      })
      return await prisma.videoVariantUpload.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
}))
