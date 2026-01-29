import { GraphQLError } from 'graphql'

import { MuxSubtitleTrackStatus, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { dynamicImport } from '../../../lib/dynamicImport'

import { isValidMuxGeneratedSubtitleLanguageCode } from '../video/service'
import { getMuxTrackByBcp47 } from './service'
import {
  muxAiSubtitlesWorkflow,
  MuxAiSubtitleWorkflowInput
} from '../../../workers/muxSubtitles/workflow'

function normalizeLegacyStatus(status: MuxSubtitleTrackStatus): MuxSubtitleTrackStatus {
  if (status === MuxSubtitleTrackStatus.queued || status === MuxSubtitleTrackStatus.not_requested)
    return MuxSubtitleTrackStatus.processing
  return status
}

function withLegacyStatus<T extends { status: MuxSubtitleTrackStatus }>(track: T): T {
  return {
    ...track,
    status: normalizeLegacyStatus(track.status)
  }
}

function assertAiSubtitleAdminToken(authorization: string | null | undefined): void {
  const expected = process.env.AI_SUBTITLE_ADMIN_TOKEN
  if (expected == null) {
    throw new Error('Missing AI_SUBTITLE_ADMIN_TOKEN')
  }

  const token = authorization?.replace(/^Bearer\\s+/i, '')
  if (token !== expected) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHORIZED' }
    })
  }
}

builder.prismaObject('MuxSubtitleTrack', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    trackId: t.exposeString('trackId', { nullable: true }),
    source: t.exposeString('source', { nullable: false }),
    status: t.exposeString('status', { nullable: false }),
    bcp47: t.exposeString('bcp47', { nullable: false }),
    muxVideoId: t.exposeID('muxVideoId', { nullable: false }),
    workflowRunId: t.exposeString('workflowRunId', { nullable: true }),
    vttUrl: t.exposeString('vttUrl', { nullable: true }),
    errorMessage: t.exposeString('errorMessage', { nullable: true })
  })
})

builder.queryFields((t) => ({
  getMyGeneratedMuxSubtitleTrack: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'MuxSubtitleTrack',
      nullable: false,
      errors: {
        types: [Error]
      },
      args: {
        muxVideoId: t.arg({ type: 'ID', required: true }),
        bcp47: t.arg({ type: 'String', required: true }),
        userGenerated: t.arg({ type: 'Boolean', required: false })
      },
      resolve: async (
        query,
        _parent,
        { muxVideoId, bcp47, userGenerated },
        { user, currentRoles }
      ) => {
        if (user == null) {
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        const isUserGenerated = !currentRoles.includes('publisher')
          ? true
          : (userGenerated ?? true)

        const subtitleTrack = await prisma.muxSubtitleTrack.findFirst({
          ...query,
          where: { muxVideoId, bcp47 },
          include: { muxVideo: true }
        })

        if (subtitleTrack == null) {
          const muxVideo = await prisma.muxVideo.findUniqueOrThrow({
            where: { id: muxVideoId, userId: user.id }
          })

          if (muxVideo.assetId == null) {
            throw new Error('Mux asset ID is null')
          }

          const muxTrack = await getMuxTrackByBcp47(
            muxVideo.assetId,
            bcp47,
            isUserGenerated
          )

          if (muxTrack == null || muxTrack.id == null) {
            throw new Error('Mux track not found')
          }

          const created = await prisma.muxSubtitleTrack.create({
            data: {
              muxVideoId,
              bcp47,
              trackId: muxTrack.id,
              source: 'generated',
              status:
                muxTrack.status === 'ready'
                  ? MuxSubtitleTrackStatus.ready
                  : muxTrack.status === 'preparing'
                    ? MuxSubtitleTrackStatus.processing
                    : MuxSubtitleTrackStatus.errored
            }
          })
          return withLegacyStatus(created)
        }
        if (subtitleTrack.status === 'processing') {
          const muxVideo = await prisma.muxVideo.findUniqueOrThrow({
            where: { id: muxVideoId, userId: user.id }
          })
          if (muxVideo.assetId == null) {
            throw new Error('Mux asset ID is null')
          }

          const muxTrack = await getMuxTrackByBcp47(
            muxVideo.assetId,
            bcp47,
            isUserGenerated
          )

          if (muxTrack == null || muxTrack.id == null) {
            throw new Error('Mux track not found')
          }

          const updated = await prisma.muxSubtitleTrack.update({
            where: { id: subtitleTrack.id },
            data: {
              status:
                muxTrack.status === 'ready'
                  ? MuxSubtitleTrackStatus.ready
                  : muxTrack.status === 'preparing'
                    ? MuxSubtitleTrackStatus.processing
                    : MuxSubtitleTrackStatus.errored
            }
          })
          return withLegacyStatus(updated)
        }

        return withLegacyStatus(subtitleTrack)
      }
    })
}))

builder.mutationFields((t) => ({
  requestMuxAiSubtitles: t.prismaField({
    type: 'MuxSubtitleTrack',
    nullable: false,
    errors: {
      types: [Error]
    },
    args: {
      muxVideoId: t.arg({ type: 'ID', required: true }),
      bcp47: t.arg({ type: 'String', required: true }),
      languageId: t.arg({ type: 'ID', required: true }),
      edition: t.arg({ type: 'String', required: false }),
      videoVariantId: t.arg({ type: 'ID', required: false })
    },
    resolve: async (
      query,
      _parent,
      { muxVideoId, bcp47, languageId, edition = 'base', videoVariantId },
      { authorization }
    ) => {
      assertAiSubtitleAdminToken(authorization)

      if (!isValidMuxGeneratedSubtitleLanguageCode(bcp47)) {
        throw new GraphQLError(`Invalid language code: ${bcp47}`, {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      const muxVideo = await prisma.muxVideo.findUniqueOrThrow({
        where: { id: muxVideoId }
      })

      if (muxVideo.assetId == null) {
        throw new Error('Mux asset ID is null')
      }

      let variantsForMux: Array<{ id: string; videoId: string; edition: string }>

      if (videoVariantId != null) {
        const videoVariant = await prisma.videoVariant.findFirst({
          where: { id: videoVariantId, muxVideoId }
        })

        if (videoVariant == null) {
          throw new Error('Video variant not found for provided videoVariantId')
        }

        variantsForMux = [videoVariant]
      } else {
        variantsForMux = await prisma.videoVariant.findMany({
          where: { muxVideoId, edition }
        })
      }

      if (variantsForMux.length === 0) {
        throw new Error('No video variant found for muxVideoId and edition')
      }

      if (variantsForMux.length > 1 && videoVariantId == null) {
        throw new Error(
          'Multiple video variants match this muxVideoId; provide videoVariantId'
        )
      }

      const selectedVariant = variantsForMux[0]
      if (selectedVariant == null || selectedVariant.videoId == null) {
        throw new Error('Video variant is missing videoId')
      }

      if (videoVariantId != null && selectedVariant.edition !== edition) {
        throw new Error('Edition does not match provided videoVariantId')
      }

      const existing = await prisma.muxSubtitleTrack.findUnique({
        where: {
          muxVideoId_bcp47_source: {
            muxVideoId,
            bcp47,
            source: 'generated'
          }
        }
      })

      if (
        existing != null &&
        (existing.status === 'queued' || existing.status === 'processing')
      ) {
        return existing
      }

      if (existing?.status === 'ready' && existing.vttUrl != null) {
        return existing
      }

      const queuedTrack = await prisma.muxSubtitleTrack.upsert({
        ...query,
        where: {
          muxVideoId_bcp47_source: {
            muxVideoId,
            bcp47,
            source: 'generated'
          }
        },
        update: {
          status: 'queued',
          workflowRunId: null,
          vttUrl: null,
          errorMessage: null,
          trackId: null
        },
        create: {
          muxVideoId,
          bcp47,
          source: 'generated',
          status: 'queued'
        }
      })

      const { start } = await dynamicImport('workflow/api')
      const baseUrl =
        process.env.MUX_SUBTITLES_WORKER_URL ??
        process.env.WORKFLOW_LOCAL_BASE_URL ??
        (process.env.MUX_SUBTITLES_WORKER_PORT != null
          ? `http://localhost:${process.env.MUX_SUBTITLES_WORKER_PORT}`
          : undefined)

      if (baseUrl != null) {
        process.env.WORKFLOW_LOCAL_BASE_URL = baseUrl
      }

      const workflowInput: MuxAiSubtitleWorkflowInput = {
        muxVideoId,
        assetId: muxVideo.assetId,
        bcp47,
        languageId: String(languageId),
        edition,
        videoId: selectedVariant.videoId
      }

      const run = await start(muxAiSubtitlesWorkflow, [workflowInput])

      return await prisma.muxSubtitleTrack.update({
        ...query,
        where: { id: queuedTrack.id },
        data: { workflowRunId: run.runId }
      })
    }
  })
}))
