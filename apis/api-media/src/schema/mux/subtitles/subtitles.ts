import { GraphQLError } from 'graphql'
import { ZodError } from 'zod'

import { MuxSubtitleTrackSource, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'

import {
  createGeneratedSubtitlesByAssetId,
  getSubtitleTrack,
  muxSubtitleResponseArraySchema
} from './service'

export const MuxSubtitleTrack = builder.prismaObject('MuxSubtitleTrack', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    trackId: t.exposeString('trackId'),
    languageCode: t.exposeString('languageCode'),
    muxLanguageName: t.exposeString('muxLanguageName', { nullable: true }),
    readyToStream: t.exposeBoolean('readyToStream', { nullable: false }),
    source: t.exposeString('source'),
    muxVideo: t.relation('muxVideo', { nullable: false })
  })
})

builder.queryFields((t) => ({
  getMyMuxSubtitleTrack: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxSubtitleTrack',
    nullable: false,
    errors: {
      types: [Error]
    },
    args: {
      id: t.arg({ type: 'ID', required: true }),
      userGenerated: t.arg({ type: 'Boolean', required: false })
    },
    resolve: async (
      query,
      _root,
      { id, userGenerated },
      { user, currentRoles }
    ) => {
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isUserGenerated = !currentRoles.includes('publisher')
        ? true
        : (userGenerated ?? true)

      let subtitleTrack = await prisma.muxSubtitleTrack.findFirstOrThrow({
        ...query,
        where: {
          id,
          muxVideo: {
            userId: user.id
          }
        }
      })

      if (!subtitleTrack.readyToStream) {
        try {
          const muxTrack = await getSubtitleTrack(
            subtitleTrack.muxVideoId,
            subtitleTrack.trackId,
            isUserGenerated
          )

          if (muxTrack?.status === 'ready') {
            subtitleTrack = await prisma.muxSubtitleTrack.update({
              ...query,
              where: { id },
              data: {
                readyToStream: true
              }
            })
          }
        } catch {
          throw new Error('Failed to check subtitle track status')
        }
      }

      return subtitleTrack
    }
  })
}))

builder.mutationFields((t) => ({
  createMuxGeneratedSubtitlesByAssetId: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'MuxSubtitleTrack',
      nullable: false,
      errors: {
        types: [Error, ZodError]
      },
      args: {
        assetId: t.arg({ type: 'ID', required: true }),
        languageCode: t.arg({ type: 'String', required: true }),
        name: t.arg({ type: 'String', required: true }),
        userGenerated: t.arg({ type: 'Boolean', required: false })
      },
      resolve: async (
        query,
        _root,
        { assetId, languageCode, name, userGenerated },
        { user, currentRoles }
      ) => {
        if (user == null)
          throw new GraphQLError('User not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        const isUserGenerated = !currentRoles.includes('publisher')
          ? true
          : (userGenerated ?? true)

        const existingSubtitle = await prisma.muxVideo.findFirst({
          where: { assetId },
          include: {
            subtitles: true
          }
        })
        if (existingSubtitle != null) {
          throw new Error('Subtitle already exists')
        }

        const muxSubtitleResponse = await createGeneratedSubtitlesByAssetId(
          isUserGenerated,
          assetId,
          languageCode,
          name
        )

        const subtitle = muxSubtitleResponseArraySchema
          .parse(muxSubtitleResponse)
          .find((subtitle) => subtitle.language_code === languageCode)

        if (!subtitle) {
          throw new Error(
            'Subtitle not received from Mux API, received: ' +
              JSON.stringify(muxSubtitleResponse)
          )
        }

        return await prisma.muxSubtitleTrack.create({
          ...query,
          data: {
            trackId: subtitle.id,
            languageCode,
            muxLanguageName: name,
            muxVideoId: assetId,
            source: MuxSubtitleTrackSource.generated,
            readyToStream: subtitle.status === 'ready'
          }
        })
      }
    })
}))
