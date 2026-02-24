import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { builder } from '../builder'
import { handleParentVariantCreation } from '../videoVariant/videoVariant'

import { updateVideoAvailableLanguages } from './lib/updateAvailableLanguages'

const VideoPublishChildrenAndLanguagesResult = builder.objectRef<{
  parentId: string
  publishedChildIds: string[]
  publishedChildrenCount: number
  publishedVariantIds: string[]
  publishedVariantsCount: number
}>('VideoPublishChildrenAndLanguagesResult')
VideoPublishChildrenAndLanguagesResult.implement({
  fields: (t) => ({
    parentId: t.id({ resolve: (obj) => obj.parentId }),
    publishedChildIds: t.idList({ resolve: (obj) => obj.publishedChildIds }),
    publishedChildrenCount: t.int({
      resolve: (obj) => obj.publishedChildrenCount
    }),
    publishedVariantIds: t.idList({
      resolve: (obj) => obj.publishedVariantIds
    }),
    publishedVariantsCount: t.int({
      resolve: (obj) => obj.publishedVariantsCount
    })
  })
})

builder.mutationFields((t) => ({
  videoPublishChildrenAndLanguages: t.withAuth({ isPublisher: true }).field({
    type: VideoPublishChildrenAndLanguagesResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, { id }) => {
      // Fetch parent, children and their unpublished variants
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

      const allChildIds = parent.children.map((c) => c.id)
      const childIdsToPublish = parent.children
        .filter((c) => !c.published)
        .map((c) => c.id)

      // Get unpublished variants across all children
      const unpublishedVariants = await prisma.videoVariant.findMany({
        where: { videoId: { in: allChildIds }, published: false },
        select: { id: true, videoId: true, languageId: true }
      })

      const now = new Date()
      await prisma.$transaction(async (tx) => {
        // Publish parent
        await tx.video.update({
          where: { id: parent.id },
          data: {
            published: true,
            publishedAt: parent.publishedAt ?? now
          }
        })

        // Publish children
        if (childIdsToPublish.length > 0) {
          await tx.video.updateMany({
            where: { id: { in: childIdsToPublish } },
            data: { published: true, publishedAt: now }
          })
        }

        // Publish all unpublished variants for children
        if (unpublishedVariants.length > 0) {
          const unpublishedVariantIds = unpublishedVariants.map((v) => v.id)
          await tx.videoVariant.updateMany({
            where: { id: { in: unpublishedVariantIds } },
            data: { published: true }
          })
        }
      })

      try {
        await Promise.all(
          allChildIds.map(async (childId) => {
            await updateVideoAvailableLanguages(childId, {
              skipAlgolia: true,
              skipCache: true
            })
          })
        )
        await updateVideoAvailableLanguages(parent.id, {
          skipAlgolia: true,
          skipCache: true
        })
      } catch (error) {
        console.error('Language management update error:', error)
      }

      // Ensure parent has empty variants for all published child variant languages
      const variantsToConsider = await prisma.videoVariant.findMany({
        where: { videoId: { in: allChildIds }, published: true },
        select: { videoId: true, languageId: true, id: true }
      })

      await Promise.all(
        variantsToConsider.map(({ videoId, languageId }) =>
          handleParentVariantCreation(videoId, languageId).catch((error) => {
            console.error('Parent variant creation error:', error)
          })
        )
      )

      // Update indices and caches
      try {
        // Update videos index for parent + all children (hasAvailableLanguages relies on availableLanguages)
        await Promise.all(
          [parent.id, ...allChildIds].map((videoId) =>
            updateVideoInAlgolia(videoId)
          )
        )
      } catch (error) {
        console.error('Algolia update error:', error)
      }

      try {
        await videoCacheReset(parent.id)
        await Promise.all(
          allChildIds.map(async (childId) => {
            try {
              await videoCacheReset(childId)
            } catch (error) {
              console.error('Cache reset error:', error)
            }
          })
        )
      } catch (error) {
        console.error('Cache reset error:', error)
      }

      // Update variant indices and caches
      await Promise.all(
        variantsToConsider.map(async ({ id: variantId, videoId }) => {
          try {
            await updateVideoVariantInAlgolia(variantId)
          } catch (error) {
            console.error('Algolia update error:', error)
          }
          try {
            void videoVariantCacheReset(variantId)
            void videoCacheReset(videoId)
          } catch (error) {
            console.error('Cache reset error:', error)
          }
        })
      )

      return {
        parentId: parent.id,
        publishedChildIds: childIdsToPublish,
        publishedChildrenCount: childIdsToPublish.length,
        publishedVariantIds: unpublishedVariants.map((v) => v.id),
        publishedVariantsCount: unpublishedVariants.length
      }
    }
  })
}))
