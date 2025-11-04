import { GraphQLError } from 'graphql'

import { MuxSubtitleTrackStatus, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { getVideo } from '../video/service'

builder.prismaObject('MuxSubtitleTrack', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    trackId: t.exposeString('trackId', { nullable: false }),
    source: t.exposeString('source', { nullable: false }),
    status: t.exposeString('status', { nullable: false }),
    bcp47: t.exposeString('bcp47', { nullable: false }),
    muxVideoId: t.exposeID('muxVideoId', { nullable: false })
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

          const muxAsset = await getVideo(muxVideo.assetId, isUserGenerated)

          const muxTrack = muxAsset.tracks?.find(
            (track) =>
              track.type === 'text' &&
              track.language_code === bcp47 &&
              track.text_source === 'generated_vod'
          )

          if (muxTrack == null || muxTrack.id == null) {
            throw new Error('Mux track not found')
          }

          return await prisma.muxSubtitleTrack.create({
            data: {
              muxVideoId,
              bcp47,
              trackId: muxTrack.id,
              source: 'generated',
              status:
                muxTrack.status === 'ready'
                  ? 'ready'
                  : muxTrack.status === 'preparing'
                    ? 'processing'
                    : 'errored'
            }
          })
        }
        if (subtitleTrack.status === 'processing') {
          const muxVideo = await prisma.muxVideo.findUniqueOrThrow({
            where: { id: muxVideoId, userId: user.id }
          })
          if (muxVideo.assetId == null) {
            throw new Error('Mux asset ID is null')
          }

          const muxAsset = await getVideo(muxVideo.assetId, isUserGenerated)

          const muxTrack = muxAsset.tracks?.find(
            (track) => track.id === subtitleTrack.trackId
          )

          if (muxTrack == null || muxTrack.id == null) {
            throw new Error('Mux track not found')
          }

          return await prisma.muxSubtitleTrack.update({
            where: { id: subtitleTrack.id },
            data: {
              status:
                muxTrack.status === 'ready'
                  ? 'ready'
                  : muxTrack.status === 'preparing'
                    ? 'processing'
                    : 'errored'
            }
          })
        }

        return subtitleTrack
      }
    })
}))
