import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { videoCacheReset } from '../../lib/videoCacheReset'
import { builder } from '../builder'
import { handleParentVariantCreation } from '../videoVariant/videoVariant'

const VideoPublishChildrenResult = builder.objectRef<{
  parentId: string
  publishedChildIds: string[]
  publishedChildrenCount: number
}>('VideoPublishChildrenResult')
VideoPublishChildrenResult.implement({
  fields: (t) => ({
    parentId: t.id({ resolve: (obj) => obj.parentId }),
    publishedChildIds: t.idList({ resolve: (obj) => obj.publishedChildIds }),
    publishedChildrenCount: t.int({
      resolve: (obj) => obj.publishedChildrenCount
    })
  })
})

builder.mutationFields((t) => ({
  videoPublishChildren: t.withAuth({ isPublisher: true }).field({
    type: VideoPublishChildrenResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, { id }) => {
      // Fetch parent and children
      const parent = await prisma.video.findUnique({
        where: { id },
        select: {
          id: true,
          publishedAt: true,
          children: {
            select: { id: true, published: true }
          }
        }
      })

      if (parent == null) {
        throw new Error(`Video with id ${id} not found`)
      }

      const childIdsToPublish = parent.children
        .filter((c) => !c.published)
        .map((c) => c.id)

      // Publish parent and unpublished children together
      const now = new Date()
      await prisma.$transaction(async (tx) => {
        await tx.video.update({
          where: { id: parent.id },
          data: {
            published: true,
            publishedAt: parent.publishedAt ?? now
          }
        })

        if (childIdsToPublish.length > 0) {
          await tx.video.updateMany({
            where: { id: { in: childIdsToPublish } },
            data: { published: true, publishedAt: now }
          })
        }
      })

      // For all published child variants, ensure parent has empty variants
      if (childIdsToPublish.length > 0 || parent.publishedAt == null) {
        const publishedChildVariants = await prisma.videoVariant.findMany({
          where: {
            videoId: { in: parent.children.map((c) => c.id) },
            published: true
          },
          select: { videoId: true, languageId: true }
        })

        await Promise.all(
          publishedChildVariants.map(({ videoId, languageId }) =>
            handleParentVariantCreation(videoId, languageId).catch((error) => {
              console.error('Parent variant creation error:', error)
            })
          )
        )
      }

      try {
        await updateVideoInAlgolia(parent.id)
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(parent.id)
        // Also reset caches for affected children
        await Promise.all(
          parent.children.map(async (c) => {
            try {
              await videoCacheReset(c.id)
            } catch (error) {
              console.error('Cache reset error:', error)
            }
          })
        )
      } catch (error) {
        console.error('Cache reset error:', error)
      }

      const publishedChildrenCount = childIdsToPublish.length
      return {
        parentId: parent.id,
        publishedChildIds: childIdsToPublish,
        publishedChildrenCount
      }
    }
  })
}))
