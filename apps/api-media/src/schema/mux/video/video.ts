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
    id: t.exposeID('id', { nullable: false }),
    uploadUrl: t.exposeString('uploadUrl'),
    userId: t.exposeID('userId', { nullable: false }),
    createdAt: t.expose('createdAt', {
      type: 'Date',
      nullable: false
    }),
    readyToStream: t.exposeBoolean('readyToStream', { nullable: false })
  })
})

builder.queryFields((t) => ({
  getMyMuxVideos: t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['MuxVideo'],
    nullable: false,
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
  getMyMuxVideo: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
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

        if (muxVideo.status === 'ready') {
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
  createMuxVideoUploadByFile: t
    .withAuth({ isAuthenticated: true })
    .prismaField({
      type: 'MuxVideo',
      nullable: false,
      args: {
        name: t.arg({ type: 'String', required: true })
      },
      resolve: async (query, _root, { name }, { user }) => {
        if (user == null) throw new Error('User not found')

        const { id, uploadUrl } = await createVideoByDirectUpload()

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
  createMuxVideoUploadByUrl: t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'MuxVideo',
    nullable: false,
    args: {
      url: t.arg({ type: 'String', required: true })
    },
    resolve: async (query, _root, { url }, { user }) => {
      if (user == null) throw new Error('User not found')

      const { id } = await createVideoFromUrl(url)

      return await prisma.muxVideo.create({
        ...query,
        data: {
          id,
          userId: user.id
        }
      })
    }
  }),
  deleteMuxVideo: t.withAuth({ isAuthenticated: true }).boolean({
    nullable: false,
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
