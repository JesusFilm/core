import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/media/client'

import {
  getAlgoliaClient,
  getAlgoliaConfig
} from '../../../lib/algolia/algoliaClient'
import { updateVideoInAlgolia } from '../../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../../lib/algolia/algoliaVideoVariantUpdate'
import { logger } from '../../../logger'
import { builder } from '../../builder'

const getErrorString = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  if (typeof err === 'string') {
    return err
  }

  try {
    return JSON.stringify(err)
  } catch {
    return String(err)
  }
}

const CheckVideoInAlgoliaMismatchRef = builder
  .objectRef<{
    field: string
    expected: string | null
    actual: string | null
  }>('CheckVideoInAlgoliaMismatch')
  .implement({
    fields: (t) => ({
      field: t.exposeString('field'),
      expected: t.exposeString('expected', { nullable: true }),
      actual: t.exposeString('actual', { nullable: true })
    })
  })

const CheckVideoInAlgoliaResultRef = builder
  .objectRef<{
    ok: boolean
    mismatches: Array<{
      field: string
      expected: string | null
      actual: string | null
    }>
    recordUrl: string | null
    error: string | null
  }>('CheckVideoInAlgoliaResult')
  .implement({
    fields: (t) => ({
      ok: t.exposeBoolean('ok'),
      mismatches: t.field({
        type: [CheckVideoInAlgoliaMismatchRef],
        resolve: (parent) => parent.mismatches
      }),
      recordUrl: t.exposeString('recordUrl', { nullable: true }),
      error: t.exposeString('error', { nullable: true })
    })
  })

const CheckVideoVariantsInAlgoliaResultRef = builder
  .objectRef<{
    ok: boolean
    missingVariants: string[]
    browseUrl: string | null
  }>('CheckVideoVariantsInAlgoliaResult')
  .implement({
    fields: (t) => ({
      ok: t.exposeBoolean('ok'),
      missingVariants: t.exposeStringList('missingVariants'),
      browseUrl: t.exposeString('browseUrl', { nullable: true })
    })
  })

builder.queryFields((t) => ({
  checkVideoInAlgolia: t.withAuth({ isPublisher: true }).field({
    type: CheckVideoInAlgoliaResultRef,
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_parent, { videoId }) => {
      const client = getAlgoliaClient()
      const algoliaConfig = getAlgoliaConfig()

      // Fetch minimal video data to validate against Algolia record
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: {
          id: true,
          label: true,
          restrictViewPlatforms: true,
          keywords: {
            select: { value: true }
          },
          variants: {
            select: {
              hls: true,
              lengthInMilliseconds: true,
              downloadable: true
            },
            where: { languageId: '529' },
            take: 1
          }
        }
      })

      if (video == null) {
        throw new GraphQLError(`Video with id ${videoId} not found`)
      }

      const primaryVariant = video.variants[0]
      const isVideoContent = primaryVariant?.hls != null
      const isDownloadable =
        video.label === 'collection' || video.label === 'series'
          ? false
          : (primaryVariant?.downloadable ?? false)
      const expected = {
        objectID: video.id,
        mediaComponentId: video.id,
        subType: video.label,
        componentType: isVideoContent ? 'content' : 'container',
        contentType: isVideoContent ? 'video' : 'none',
        lengthInMilliseconds: primaryVariant?.lengthInMilliseconds ?? 0,
        isDownloadable,
        restrictViewArclight: video.restrictViewPlatforms.includes('arclight'),
        keywords: video.keywords.map((k) => k.value).sort()
      }

      try {
        const record = await client.getObject({
          indexName: algoliaConfig.videosIndex,
          objectID: videoId
        })

        const actual = {
          objectID: record.objectID,
          mediaComponentId: record.mediaComponentId,
          subType: record.subType,
          componentType: record.componentType,
          contentType: record.contentType,
          lengthInMilliseconds: record.lengthInMilliseconds,
          isDownloadable: record.isDownloadable,
          restrictViewArclight: record.restrictViewArclight,
          keywords: Array.isArray(record.keywords)
            ? [...(record.keywords as string[])].sort()
            : []
        }

        const mismatches = Object.entries(expected)
          .map(([key, value]) => {
            const actualValue = (actual as Record<string, unknown>)[key]
            const matches =
              JSON.stringify(actualValue) === JSON.stringify(value)
            return matches
              ? null
              : {
                  field: key,
                  expected: JSON.stringify(value),
                  actual: JSON.stringify(actualValue)
                }
          })
          .filter(Boolean) as Array<{
          field: string
          expected: string
          actual: string
        }>

        return {
          ok: mismatches.length === 0,
          mismatches,
          recordUrl: `https://www.algolia.com/apps/${algoliaConfig.appId}/explorer/browse/${algoliaConfig.videosIndex}?query=${encodeURIComponent(videoId)}`,
          error: null
        }
      } catch (err) {
        const errorString = getErrorString(err)
        const appId = algoliaConfig.appId
        const videosIndex = algoliaConfig.videosIndex
        const context = { videoId, appId, videosIndex }

        logger?.error(
          { err, ...context },
          'Algolia getObject failed while checking video in Algolia'
        )

        if (logger == null) {
          console.error(
            `Algolia getObject failed while checking video in Algolia (videoId=${videoId}, appId=${appId}, videosIndex=${videosIndex}): ${errorString}`
          )
        }

        return {
          ok: false,
          mismatches: [],
          recordUrl: `https://www.algolia.com/apps/${appId}/explorer/browse/${videosIndex}?query=${encodeURIComponent(videoId)}`,
          error: errorString
        }
      }
    }
  }),
  checkVideoVariantsInAlgolia: t.withAuth({ isPublisher: true }).field({
    type: CheckVideoVariantsInAlgoliaResultRef,
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_parent, { videoId }) => {
      const client = getAlgoliaClient()
      const algoliaConfig = getAlgoliaConfig()

      // Get all variants for this video
      const variants = await prisma.videoVariant.findMany({
        where: { videoId },
        select: { id: true }
      })

      const missingVariants: string[] = []

      for (const variant of variants) {
        try {
          const record = await client.getObject({
            indexName: algoliaConfig.videoVariantsIndex,
            objectID: variant.id
          })
          const objectIdMatches = record.objectID === variant.id
          const videoIdMatches =
            record.videoId == null || record.videoId === videoId

          if (!(objectIdMatches && videoIdMatches)) {
            missingVariants.push(variant.id)
          }
        } catch {
          missingVariants.push(variant.id)
        }
      }

      return {
        ok: missingVariants.length === 0,
        missingVariants,
        browseUrl: `https://www.algolia.com/apps/${algoliaConfig.appId}/explorer/browse/${algoliaConfig.videoVariantsIndex}?query=${encodeURIComponent(videoId)}`
      }
    }
  })
}))

builder.mutationFields((t) => ({
  updateVideoAlgoliaIndex: t.withAuth({ isPublisher: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_parent, { videoId }) => {
      const video = await prisma.video.findUnique({
        where: { id: videoId },
        select: { id: true }
      })

      if (video == null) {
        throw new GraphQLError(`Video with id ${videoId} not found`)
      }

      await updateVideoInAlgolia(videoId)
      return true
    }
  }),
  updateVideoVariantAlgoliaIndex: t.withAuth({ isPublisher: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      videoId: t.arg.id({ required: true })
    },
    resolve: async (_parent, { videoId }) => {
      // Get all variants for this video
      const variants = await prisma.videoVariant.findMany({
        where: { videoId },
        select: { id: true }
      })

      if (variants.length === 0) {
        throw new GraphQLError(`No variants found for video ${videoId}`)
      }

      // Update all variants in Algolia
      const results = await Promise.allSettled(
        variants.map(async (variant) => {
          await updateVideoVariantInAlgolia(variant.id)
        })
      )

      const failures = results.flatMap((result, index) => {
        if (result.status === 'fulfilled') {
          return []
        }

        return [
          {
            variantId: variants[index]?.id,
            error: getErrorString(result.reason)
          }
        ]
      })

      if (failures.length > 0) {
        logger?.error(
          { videoId, failures },
          'Algolia update failed for one or more video variants'
        )

        const failedVariantIds = failures
          .map((f) => f.variantId)
          .filter((id): id is string => id != null)

        const failedVariantIdsPreview = failedVariantIds.slice(0, 10).join(', ')
        const moreCount =
          failedVariantIds.length > 10
            ? ` (+${failedVariantIds.length - 10} more)`
            : ''

        throw new GraphQLError(
          `Failed to update ${failures.length}/${variants.length} variants in Algolia for video ${videoId}. Failed variantIds: ${failedVariantIdsPreview}${moreCount}`
        )
      }

      return true
    }
  })
}))
