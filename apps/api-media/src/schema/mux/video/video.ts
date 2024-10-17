import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'

import {
  createVideoByDirectUpload,
  createVideoFromUrl,
  deleteVideo,
  getVideo
} from './service'

builder.prismaObject('MuxVideo', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uploadUrl: t.exposeString('uploadUrl', { nullable: true }),
    userId: t.exposeID('userId'),
    createdAt: t.expose('createdAt', {
      type: 'Date'
    }),
    readyToStream: t.exposeBoolean('readyToStream')
  })
})

builder.queryFields((t) => ({
  getMyMuxVideos: t.prismaField({
    type: ['MuxVideo'],
    authScopes: {
      isAuthenticated: true
    },
    args: {
      offset: t.arg.int({ required: false }),
      limit: t.arg.int({ required: false })
    },
    resolve: async (query, _root, { offset, limit }, { user }) => {
      if (user == null) throw new Error('User not found')

      return await prisma.muxVideo.findMany({
        ...query,
        where: { userId: user.id },
        take: limit ?? undefined,
        skip: offset ?? undefined
      })
    }
  }),
  getMyMuxVideo: t.prismaField({
    type: 'MuxVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (query, _root, { id }, { user }) => {
      if (user == null) throw new Error('User not found')

      const video = await prisma.muxVideo.findFirstOrThrow({
        ...query,
        where: { id, userId: user.id }
      })

      if (!video.readyToStream) {
        const muxVideo = await getVideo(id)

        if (muxVideo.readyToStream === true) {
          return await prisma.muxVideo.update({
            ...query,
            where: { id },
            data: {
              readyToStream: true
            }
          })
        }
      }
      return video
    }
  })
}))

builder.mutationFields((t) => ({
  createMuxVideoUploadByFile: t.prismaField({
    type: 'MuxVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      uploadLength: t.arg({ type: 'Int', required: true }),
      name: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { uploadLength, name }, { user }) => {
      if (user == null) throw new Error('User not found')

      const { id, uploadUrl } = await createVideoByDirectUpload(
        uploadLength,
        name,
        user.id
      )

      return await prisma.muxVideo.create({
        ...query,
        data: {
          id,
          uploadUrl,
          userId: user.id,
          name
        }
      })
    }
  }),
  createMuxVideoUploadByUrl: t.prismaField({
    type: 'MuxVideo',
    authScopes: {
      isAuthenticated: true
    },
    args: {
      url: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { url }, { user }) => {
      if (user == null) throw new Error('User not found')

      const { uid: id } = await createVideoFromUrl(url, user.id)

      return await prisma.muxVideo.create({
        ...query,
        data: {
          id,
          userId: user.id
        }
      })
    }
  }),
  deleteMuxVideo: t.boolean({
    authScopes: {
      isAuthenticated: true
    },
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_root, { id }, { user }) => {
      if (user == null) throw new Error('User not found')

      await prisma.muxVideo.findUniqueOrThrow({
        where: { id, userId: user.id }
      })

      await deleteVideo(id)

      await prisma.muxVideo.delete({ where: { id } })

      return true
    }
  })
}))
