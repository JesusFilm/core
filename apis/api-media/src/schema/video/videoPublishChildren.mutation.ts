import { prisma } from '@core/prisma/media/client'

import { getRequiredParentLanguages } from '../../lib/parentLanguageAudit/parentLanguageAudit'
import {
  videoCacheReset,
  videoVariantCacheReset
} from '../../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../../workers/videoAlgoliaSync'
import { builder } from '../builder'
import { logger } from '../logger'
import {
  createEmptyParentVariant,
  handleParentVariantCreation
} from '../videoVariant/videoVariant'

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
  variantVideoIds: string[]
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
  missingParentLanguageIds: string[]
  recoveredParentLanguageIds: string[]
}

type VideoPublishPlanMode = 'childrenVideosOnly' | 'childrenVideosAndVariants'

type MissingParentLanguage = {
  languageId: string
  childVideoId: string
}

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

  const variantVideoIds =
    planMode === 'childrenVideosAndVariants'
      ? [
          ...(parent.published || candidateVideoIdsToPublish.includes(parent.id)
            ? [parent.id]
            : []),
          ...parent.children
            .filter(
              (child) =>
                child.published || candidateVideoIdsToPublish.includes(child.id)
            )
            .map((child) => child.id)
        ]
      : []

  return {
    videoIdsToPublish: candidateVideoIdsToPublish,
    variantVideoIds,
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

// Compares a parent Video against its direct published children and returns
// the language IDs present on a published child Variant but absent from any
// existing Variant on the parent (empty or otherwise). Only direct published
// children participate — unpublished children and deeper descendants never
// contribute a language.
async function computeMissingParentLanguages(
  parentId: string
): Promise<MissingParentLanguage[]> {
  const [parent, requiredLanguages] = await Promise.all([
    prisma.video.findUnique({
      where: { id: parentId },
      select: { variants: { select: { languageId: true } } }
    }),
    getRequiredParentLanguages(parentId)
  ])

  if (parent == null) {
    throw new Error(`Video with id ${parentId} not found`)
  }

  const existingLanguageIds = new Set(
    parent.variants.map(({ languageId }: { languageId: string }) => languageId)
  )

  return requiredLanguages
    .filter(({ languageId }) => !existingLanguageIds.has(languageId))
    .map(({ languageId, childVideoId }) => ({ languageId, childVideoId }))
}

async function executeParentVariantsOnly(
  id: string,
  dryRun: boolean
): Promise<VideoPublishChildrenResultType> {
  const missing = await computeMissingParentLanguages(id)
  const missingParentLanguageIds = missing.map((entry) => entry.languageId)

  const result: VideoPublishChildrenResultType = {
    parentId: id,
    publishedVideoIds: [],
    publishedVideoCount: 0,
    publishedVariantIds: [],
    publishedVariantsCount: 0,
    dryRun,
    videosFailedValidation: [],
    missingParentLanguageIds,
    recoveredParentLanguageIds: []
  }

  if (dryRun || missing.length === 0) {
    return result
  }

  // Create the missing Variant directly on the requested parent `id`,
  // reusing createEmptyParentVariant's slug/language semantics instead of
  // duplicating them. handleParentVariantCreation is unsuitable here: it
  // discovers and writes to *every* parent of a child Video, so a child
  // shared by multiple parents could create a Variant on a parent other
  // than the one requested. createEmptyParentVariant is itself a no-op
  // once a Variant exists for that language, so this stays idempotent.
  const outcomes = await Promise.allSettled(
    missing.map(({ languageId }) => createEmptyParentVariant(id, languageId))
  )

  const recoveredParentLanguageIds: string[] = []
  outcomes.forEach((outcome, index) => {
    const { languageId, childVideoId } = missing[index]
    if (outcome.status === 'fulfilled') {
      recoveredParentLanguageIds.push(languageId)
      return
    }
    logger.error(
      { error: outcome.reason, parentId: id, childVideoId, languageId },
      'Parent variant recovery failed'
    )
  })

  return { ...result, recoveredParentLanguageIds }
}

const VideoPublishModeEnum = builder.enumType('VideoPublishMode', {
  values: [
    'childrenVideosOnly',
    'childrenVideosAndVariants',
    'variantsOnly',
    'parentVariantsOnly'
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
    }),
    missingParentLanguageIds: t.idList({
      description:
        'Language IDs present on a direct published child Variant but missing an empty parent Variant. Populated by parentVariantsOnly mode.',
      resolve: (obj) => obj.missingParentLanguageIds
    }),
    recoveredParentLanguageIds: t.idList({
      description:
        'Subset of missingParentLanguageIds whose parent Variant was successfully created. Populated by parentVariantsOnly mode when dryRun is false; a language missing from this list relative to missingParentLanguageIds failed and was logged.',
      resolve: (obj) => obj.recoveredParentLanguageIds
    })
  })
})

export type VideoPublishMode =
  | 'childrenVideosOnly'
  | 'childrenVideosAndVariants'
  | 'variantsOnly'
  | 'parentVariantsOnly'

export async function executeVideoPublishChildren(
  id: string,
  mode: VideoPublishMode,
  dryRun: boolean
): Promise<VideoPublishChildrenResultType> {
  if (mode === 'parentVariantsOnly') {
    return executeParentVariantsOnly(id, dryRun)
  }

  const parent = await getVideoPublishParent(id)
  const plan =
    mode !== 'variantsOnly'
      ? await buildVideoPublishPlan(parent, mode)
      : undefined
  const videoIdsToPublish = plan?.videoIdsToPublish ?? []
  const videosFailedValidation = plan?.videosFailedValidation ?? []

  let variantVideoIds: string[] = []
  if (mode === 'childrenVideosAndVariants') {
    variantVideoIds = plan?.variantVideoIds ?? []
  } else if (mode === 'variantsOnly') {
    variantVideoIds = [id]
  }

  let variantIdsToPublish: string[] = []
  const variantIdsToPublishByVideoId = new Map<string, string[]>()
  if (variantVideoIds.length > 0) {
    const unpublishedVariants = await prisma.videoVariant.findMany({
      where: {
        videoId: { in: variantVideoIds },
        published: false
      },
      select: { id: true, videoId: true }
    })
    variantIdsToPublish = unpublishedVariants.map((variant) => variant.id)
    for (const variant of unpublishedVariants) {
      const ids = variantIdsToPublishByVideoId.get(variant.videoId) ?? []
      ids.push(variant.id)
      variantIdsToPublishByVideoId.set(variant.videoId, ids)
    }
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
      videosFailedValidation,
      missingParentLanguageIds: [],
      recoveredParentLanguageIds: []
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

  const affectedVideoIds = [
    ...new Set([id, ...videoIdsToPublish, ...variantVideoIds])
  ]

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

  await Promise.allSettled(
    variantIdsToPublish.map((variantId) =>
      videoVariantCacheReset(variantId).catch((error) => {
        logger.error({ error, variantId }, 'Variant cache reset failed')
      })
    )
  )
  await Promise.allSettled(
    affectedVideoIds.map(async (videoId) => {
      await enqueueVideoAlgoliaSync(
        videoId,
        {
          syncVideoRecord: true,
          syncAllVariants: false,
          syncPublishedFlag: videoIdsToPublish.includes(videoId),
          dirtyVariantIds: variantIdsToPublishByVideoId.get(videoId) ?? [],
          deletedVariantIds: []
        },
        logger
      )

      await videoCacheReset(videoId).catch((error) => {
        logger.error({ error, videoId }, 'Video cache reset failed')
      })
    })
  )

  return {
    parentId: id,
    publishedVideoIds: videoIdsToPublish,
    publishedVideoCount: videoIdsToPublish.length,
    publishedVariantIds: variantIdsToPublish,
    publishedVariantsCount: variantIdsToPublish.length,
    dryRun: false,
    videosFailedValidation,
    missingParentLanguageIds: [],
    recoveredParentLanguageIds: []
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
