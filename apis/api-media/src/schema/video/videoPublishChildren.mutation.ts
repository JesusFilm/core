import { prisma } from '@core/prisma/media/client'

import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { builder } from '../builder'
import { logger } from '../logger'
import { handleParentVariantCreation } from '../videoVariant/videoVariant'

import { updateVideoAvailableLanguages } from './lib/updateAvailableLanguages'

type PublishValidationVideo = {
  id: string
  label: string
  title: Array<{ value: string }>
  snippet: Array<{ value: string }>
  description: Array<{ value: string }>
  imageAlt: Array<{ value: string }>
  images: Array<{ id: string }>
  variants: Array<{ id: string }>
}

type VideoPublishValidationFailure = {
  videoId: string
  missingFields: string[]
  message: string
}

type VideoPublishParent = {
  id: string
  label: string
  published: boolean
  publishedAt: Date | null
  children: Array<{ id: string; published: boolean }>
}

type VideoPublishPlan = {
  videoIdsToPublish: string[]
  videosFailedValidation: VideoPublishValidationFailure[]
}

type VideoPublishChildrenResultType = {
  parentId: string
  publishedVideoIds: string[]
  publishedVideoCount: number
  publishedVariantIds: string[]
  publishedVariantsCount: number
  dryRun: boolean
  videosFailedValidation: VideoPublishValidationFailure[]
}

type VideoPublishPlanMode = 'childrenVideosOnly' | 'childrenVideosAndVariants'

function getMissingRequiredFields(
  video: PublishValidationVideo,
  planMode: VideoPublishPlanMode
): string[] {
  const missingFields: string[] = []
  const isContainerVideo =
    video.label === 'collection' || video.label === 'series'

  if (!video.title[0]?.value?.trim()) {
    missingFields.push('Title')
  }
  if (!video.snippet[0]?.value?.trim()) {
    missingFields.push('Short Description')
  }
  if (!video.description[0]?.value?.trim()) {
    missingFields.push('Description')
  }
  if (!video.imageAlt[0]?.value?.trim()) {
    missingFields.push('Image Alt Text')
  }
  if (video.images.length === 0) {
    missingFields.push('Banner Image')
  }
  if (!isContainerVideo && video.variants.length === 0) {
    missingFields.push(
      planMode === 'childrenVideosOnly'
        ? 'Published Video Variant'
        : 'Video Variant'
    )
  }

  return missingFields
}

async function getVideoPublishParent(id: string): Promise<VideoPublishParent> {
  const parent = await prisma.video.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      published: true,
      publishedAt: true,
      children: {
        select: { id: true, published: true }
      }
    }
  })

  if (parent == null) {
    throw new Error(`Video with id ${id} not found`)
  }

  return parent
}

async function buildVideoPublishPlan(
  parent: VideoPublishParent,
  planMode: VideoPublishPlanMode
): Promise<VideoPublishPlan> {
  const unpublishedChildIds = parent.children
    .filter((child) => !child.published)
    .map((child) => child.id)
  const candidateVideoIds = [parent.id, ...unpublishedChildIds]

  const variantSelect =
    planMode === 'childrenVideosOnly'
      ? ({
          where: { published: true },
          select: { id: true },
          take: 1
        } as const)
      : ({
          select: { id: true },
          take: 1
        } as const)

  const videosForValidation = await prisma.video.findMany({
    where: { id: { in: candidateVideoIds } },
    select: {
      id: true,
      label: true,
      title: {
        where: { primary: true },
        select: { value: true },
        take: 1
      },
      snippet: {
        where: { primary: true },
        select: { value: true },
        take: 1
      },
      description: {
        where: { primary: true },
        select: { value: true },
        take: 1
      },
      imageAlt: {
        where: { primary: true },
        select: { value: true },
        take: 1
      },
      images: {
        where: { aspectRatio: 'banner' },
        select: { id: true },
        take: 1
      },
      variants: variantSelect
    }
  })

  const validationResults: VideoPublishValidationFailure[] =
    videosForValidation.map((video: PublishValidationVideo) => {
      const missingFields = getMissingRequiredFields(video, planMode)
      return {
        videoId: video.id,
        missingFields,
        message: `${video.id} not published, missing: ${missingFields.join(', ')}`
      }
    })

  const videosFailedValidation = validationResults.filter(
    (video) => video.missingFields.length > 0
  )
  let candidateVideoIdsToPublish = validationResults
    .filter((video) => video.missingFields.length === 0)
    .map((video) => video.videoId)

  // If the parent is already published, we don't need to publish it again
  if (parent.published) {
    candidateVideoIdsToPublish = candidateVideoIdsToPublish.filter(
      (videoId) => videoId !== parent.id
    )
  }

  return {
    videoIdsToPublish: candidateVideoIdsToPublish,
    videosFailedValidation
  }
}

async function ensureParentEmptyVariantsForPublishedChildren(
  parent: VideoPublishParent,
  publishParentNow: boolean,
  publishedChildIds: string[]
): Promise<void> {
  if (
    !publishParentNow ||
    parent.label === 'featureFilm' ||
    publishedChildIds.length === 0
  ) {
    return
  }

  const publishedChildVariants = await prisma.videoVariant.findMany({
    where: {
      videoId: { in: publishedChildIds },
      published: true
    },
    select: { videoId: true, languageId: true }
  })

  await Promise.all(
    publishedChildVariants.map(
      ({ videoId, languageId }: { videoId: string; languageId: string }) =>
        handleParentVariantCreation(videoId, languageId).catch((error) => {
          logger.error(
            { error, videoId, languageId },
            'Parent variant creation failed'
          )
        })
    )
  )
}

const VideoPublishModeEnum = builder.enumType('VideoPublishMode', {
  values: [
    'childrenVideosOnly',
    'childrenVideosAndVariants',
    'variantsOnly'
  ] as const
})

const VideoPublishChildrenUnpublishedVideo = builder.objectRef<{
  videoId: string
  missingFields: string[]
  message: string
}>('VideoPublishChildrenUnpublishedVideo')
VideoPublishChildrenUnpublishedVideo.implement({
  fields: (t) => ({
    videoId: t.id({ resolve: (obj) => obj.videoId }),
    missingFields: t.stringList({ resolve: (obj) => obj.missingFields }),
    message: t.string({ resolve: (obj) => obj.message })
  })
})

const VideoPublishChildrenResult =
  builder.objectRef<VideoPublishChildrenResultType>(
    'VideoPublishChildrenResult'
  )
VideoPublishChildrenResult.implement({
  fields: (t) => ({
    parentId: t.id({ resolve: (obj) => obj.parentId }),
    publishedVideoIds: t.idList({ resolve: (obj) => obj.publishedVideoIds }),
    publishedVideoCount: t.int({
      resolve: (obj) => obj.publishedVideoCount
    }),
    publishedVariantIds: t.idList({
      resolve: (obj) => obj.publishedVariantIds
    }),
    publishedVariantsCount: t.int({
      resolve: (obj) => obj.publishedVariantsCount
    }),
    dryRun: t.boolean({
      resolve: (obj) => obj.dryRun
    }),
    videosFailedValidation: t.field({
      type: [VideoPublishChildrenUnpublishedVideo],
      nullable: false,
      resolve: (obj) => obj.videosFailedValidation
    })
  })
})

export type VideoPublishMode =
  | 'childrenVideosOnly'
  | 'childrenVideosAndVariants'
  | 'variantsOnly'

export async function executeVideoPublishChildren(
  id: string,
  mode: VideoPublishMode,
  dryRun: boolean
): Promise<VideoPublishChildrenResultType> {
  const parent = await getVideoPublishParent(id)
  const plan =
    mode !== 'variantsOnly' ? await buildVideoPublishPlan(parent, mode) : undefined
  const videoIdsToPublish = plan?.videoIdsToPublish ?? []
  const videosFailedValidation = plan?.videosFailedValidation ?? []

  let variantVideoIds: string[] = []
  if (mode === 'childrenVideosAndVariants') {
    variantVideoIds = videoIdsToPublish
  } else if (mode === 'variantsOnly') {
    variantVideoIds = [id]
  }

  let variantIdsToPublish: string[] = []
  if (variantVideoIds.length > 0) {
    const unpublishedVariants = await prisma.videoVariant.findMany({
      where: {
        videoId: { in: variantVideoIds },
        published: false
      },
      select: { id: true }
    })
    variantIdsToPublish = unpublishedVariants.map((variant) => variant.id)
  }

  if (
    dryRun ||
    (videoIdsToPublish.length === 0 && variantIdsToPublish.length === 0)
  ) {
    return {
      parentId: id,
      publishedVideoIds: videoIdsToPublish,
      publishedVideoCount: videoIdsToPublish.length,
      publishedVariantIds: variantIdsToPublish,
      publishedVariantsCount: variantIdsToPublish.length,
      dryRun,
      videosFailedValidation
    }
  }

  await prisma.$transaction(async (tx) => {
    if (videoIdsToPublish.length > 0) {
      await tx.video.updateMany({
        where: { id: { in: videoIdsToPublish } },
        data: { published: true, publishedAt: new Date() }
      })
    }

    if (variantIdsToPublish.length > 0) {
      await tx.videoVariant.updateMany({
        where: { id: { in: variantIdsToPublish } },
        data: { published: true }
      })
    }
  })

  const affectedVideoIds = [...new Set([id, ...videoIdsToPublish])]

  try {
    await Promise.all(
      affectedVideoIds.map(async (videoId) => {
        await updateVideoAvailableLanguages(videoId, {
          skipAlgolia: true,
          skipCache: true
        })
      })
    )
  } catch (error) {
    logger.error(
      { error, videoIds: affectedVideoIds },
      'Language sync failed during publish'
    )
  }

  if (mode !== 'variantsOnly') {
    const publishedChildIds = parent.children
      .filter(
        (child) => child.published || videoIdsToPublish.includes(child.id)
      )
      .map((child) => child.id)

    await ensureParentEmptyVariantsForPublishedChildren(
      parent,
      videoIdsToPublish.includes(parent.id),
      publishedChildIds
    )
  }

  await Promise.all(
    variantIdsToPublish.map(async (variantId) => {
      await updateVideoVariantInAlgolia(variantId)
      void videoVariantCacheReset(variantId)
    })
  )
  await Promise.all(
    affectedVideoIds.map(async (videoId) => {
      await updateVideoInAlgolia(videoId)
      void videoCacheReset(videoId)
    })
  )

  return {
    parentId: id,
    publishedVideoIds: videoIdsToPublish,
    publishedVideoCount: videoIdsToPublish.length,
    publishedVariantIds: variantIdsToPublish,
    publishedVariantsCount: variantIdsToPublish.length,
    dryRun: false,
    videosFailedValidation
  }
}

builder.mutationFields((t) => ({
  videoPublishChildren: t.withAuth({ isPublisher: true }).field({
    type: VideoPublishChildrenResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      mode: t.arg({ type: VideoPublishModeEnum, required: true }),
      dryRun: t.arg.boolean({ required: true })
    },
    resolve: async (_parent, { id, mode, dryRun }) =>
      executeVideoPublishChildren(id, mode, dryRun)
  })
}))
