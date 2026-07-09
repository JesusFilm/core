import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/media/client'

import {
  getAlgoliaClient,
  getAlgoliaConfig
} from '../../../lib/algolia/algoliaClient'
import { updateVideoInAlgolia } from '../../../lib/algolia/algoliaVideoUpdate'
import { getLanguages } from '../../../lib/algolia/languages'
import {
  buildVideoVariantAlgoliaObject,
  updateVideoVariantInAlgolia,
  videoVariantAlgoliaInclude
} from '../../../lib/algolia/algoliaVideoVariantUpdate'
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

type VariantIndexIssueType = 'missing' | 'stale' | 'extra' | 'failed'
type VariantIndexScanType = 'core' | 'algolia'

interface VariantIndexMismatch {
  field: string
  expected: string | null
  actual: string | null
}

interface VariantIndexIssue {
  id: string
  issueType: VariantIndexIssueType
  variantId: string | null
  objectId: string
  videoId: string | null
  languageId: string | null
  languageName: string | null
  mismatches: VariantIndexMismatch[]
  error: string | null
}

const VARIANT_INDEX_BATCH_SIZE_DEFAULT = 100
const VARIANT_INDEX_BATCH_SIZE_MAX = 500
const VARIANT_INDEX_STALE_FIELDS = [
  'videoId',
  'languageId',
  'languageEnglishName',
  'languagePrimaryName',
  'slug',
  'published',
  'videoPublished',
  'duration',
  'label',
  'titles',
  'description',
  'childrenCount',
  'image'
]

function normalizeBatchSize(batchSize: number | null | undefined): number {
  if (batchSize == null || batchSize < 1)
    return VARIANT_INDEX_BATCH_SIZE_DEFAULT
  return Math.min(batchSize, VARIANT_INDEX_BATCH_SIZE_MAX)
}

function stringifyValue(value: unknown): string | null {
  if (value == null) return null
  return JSON.stringify(value)
}

function isAlgoliaNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err == null) {
    return getErrorString(err).toLowerCase().includes('not found')
  }

  const status = (err as { status?: unknown }).status
  return (
    status === 404 || getErrorString(err).toLowerCase().includes('not found')
  )
}

function getVariantIndexMismatches(
  expected: Record<string, unknown>,
  actual: Record<string, unknown>
): VariantIndexMismatch[] {
  return VARIANT_INDEX_STALE_FIELDS.flatMap((field) => {
    const expectedValue = expected[field]
    const actualValue = actual[field]

    if (JSON.stringify(expectedValue) === JSON.stringify(actualValue)) return []

    return [
      {
        field,
        expected: stringifyValue(expectedValue),
        actual: stringifyValue(actualValue)
      }
    ]
  })
}

function getLanguageName(
  languageId: string | null | undefined,
  languages: Record<string, { english?: string; primary?: string }>
): string | null {
  if (languageId == null) return null
  return (
    languages[languageId]?.english ?? languages[languageId]?.primary ?? null
  )
}

async function browseAlgoliaVideoVariantObjectsBatch({
  cursor,
  batchSize
}: {
  cursor: string | null | undefined
  batchSize: number
}): Promise<{ hits: Array<Record<string, unknown>>; cursor: string | null }> {
  const client = getAlgoliaClient() as any
  const algoliaConfig = getAlgoliaConfig()
  const body =
    cursor != null && cursor !== ''
      ? { cursor }
      : {
          hitsPerPage: batchSize,
          attributesToRetrieve: [
            'objectID',
            'videoId',
            'languageId',
            'languageEnglishName',
            'languagePrimaryName',
            'slug',
            'published',
            'videoPublished',
            'duration',
            'label',
            'titles',
            'description',
            'childrenCount',
            'image'
          ]
        }

  const response = await client.customPost({
    path: `/1/indexes/${encodeURIComponent(algoliaConfig.videoVariantsIndex)}/browse`,
    body
  })

  return {
    hits: Array.isArray(response?.hits) ? response.hits : [],
    cursor: typeof response?.cursor === 'string' ? response.cursor : null
  }
}

const VariantIndexIssueMismatchRef = builder
  .objectRef<VariantIndexMismatch>('AlgoliaVideoVariantIndexIssueMismatch')
  .implement({
    fields: (t) => ({
      field: t.exposeString('field'),
      expected: t.exposeString('expected', { nullable: true }),
      actual: t.exposeString('actual', { nullable: true })
    })
  })

const VariantIndexIssueRef = builder
  .objectRef<VariantIndexIssue>('AlgoliaVideoVariantIndexIssue')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id'),
      issueType: t.exposeString('issueType'),
      variantId: t.exposeString('variantId', { nullable: true }),
      objectId: t.exposeString('objectId'),
      videoId: t.exposeString('videoId', { nullable: true }),
      languageId: t.exposeString('languageId', { nullable: true }),
      languageName: t.exposeString('languageName', { nullable: true }),
      mismatches: t.field({
        type: [VariantIndexIssueMismatchRef],
        resolve: (parent) => parent.mismatches
      }),
      error: t.exposeString('error', { nullable: true })
    })
  })

const CheckAlgoliaVideoVariantIndexBatchInput = builder.inputType(
  'CheckAlgoliaVideoVariantIndexBatchInput',
  {
    fields: (t) => ({
      scanType: t.string({ required: true }),
      batchKey: t.string({ required: false }),
      batchSize: t.int({ required: false })
    })
  }
)

const FixAlgoliaVideoVariantIndexIssuesInput = builder.inputType(
  'FixAlgoliaVideoVariantIndexIssuesInput',
  {
    fields: (t) => ({
      issueType: t.string({ required: true }),
      objectIds: t.stringList({ required: true })
    })
  }
)

const CheckAlgoliaVideoVariantIndexBatchResultRef = builder
  .objectRef<{
    scanType: VariantIndexScanType
    batchKey: string | null
    nextBatchKey: string | null
    done: boolean
    checkedCount: number
    missingCount: number
    staleCount: number
    extraCount: number
    failedCount: number
    issues: VariantIndexIssue[]
  }>('CheckAlgoliaVideoVariantIndexBatchResult')
  .implement({
    fields: (t) => ({
      scanType: t.exposeString('scanType'),
      batchKey: t.exposeString('batchKey', { nullable: true }),
      nextBatchKey: t.exposeString('nextBatchKey', { nullable: true }),
      done: t.exposeBoolean('done'),
      checkedCount: t.exposeInt('checkedCount'),
      missingCount: t.exposeInt('missingCount'),
      staleCount: t.exposeInt('staleCount'),
      extraCount: t.exposeInt('extraCount'),
      failedCount: t.exposeInt('failedCount'),
      issues: t.field({
        type: [VariantIndexIssueRef],
        resolve: (parent) => parent.issues
      })
    })
  })

const FixAlgoliaVideoVariantIndexIssuesResultRef = builder
  .objectRef<{
    fixedCount: number
    failedCount: number
    issues: VariantIndexIssue[]
  }>('FixAlgoliaVideoVariantIndexIssuesResult')
  .implement({
    fields: (t) => ({
      fixedCount: t.exposeInt('fixedCount'),
      failedCount: t.exposeInt('failedCount'),
      issues: t.field({
        type: [VariantIndexIssueRef],
        resolve: (parent) => parent.issues
      })
    })
  })

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
  checkAlgoliaVideoVariantIndexBatch: t.withAuth({ isPublisher: true }).field({
    type: CheckAlgoliaVideoVariantIndexBatchResultRef,
    nullable: false,
    args: {
      input: t.arg({
        type: CheckAlgoliaVideoVariantIndexBatchInput,
        required: true
      })
    },
    resolve: async (_parent, { input }) => {
      const scanType = input.scanType as VariantIndexScanType
      const batchSize = normalizeBatchSize(input.batchSize)
      const languages = await getLanguages(logger)
      const client = getAlgoliaClient()
      const algoliaConfig = getAlgoliaConfig()
      const issues: VariantIndexIssue[] = []

      if (scanType === 'core') {
        const variants = await prisma.videoVariant.findMany({
          where:
            input.batchKey != null && input.batchKey !== ''
              ? { id: { gt: input.batchKey } }
              : undefined,
          include: videoVariantAlgoliaInclude,
          orderBy: { id: 'asc' },
          take: batchSize
        })

        for (const variant of variants) {
          const expected = buildVideoVariantAlgoliaObject(variant, languages)
          try {
            const actual = (await client.getObject({
              indexName: algoliaConfig.videoVariantsIndex,
              objectID: variant.id
            })) as Record<string, unknown>
            const mismatches = getVariantIndexMismatches(expected, actual)

            if (mismatches.length > 0) {
              issues.push({
                id: `stale:${variant.id}`,
                issueType: 'stale',
                variantId: variant.id,
                objectId: variant.id,
                videoId: variant.videoId,
                languageId: variant.languageId,
                languageName: getLanguageName(variant.languageId, languages),
                mismatches,
                error: null
              })
            }
          } catch (err) {
            const isMissing = isAlgoliaNotFoundError(err)
            issues.push({
              id: `${isMissing ? 'missing' : 'failed'}:${variant.id}`,
              issueType: isMissing ? 'missing' : 'failed',
              variantId: variant.id,
              objectId: variant.id,
              videoId: variant.videoId,
              languageId: variant.languageId,
              languageName: getLanguageName(variant.languageId, languages),
              mismatches: [],
              error: getErrorString(err)
            })
          }
        }

        const done = variants.length < batchSize
        return {
          scanType,
          batchKey: input.batchKey ?? null,
          nextBatchKey: done ? null : (variants.at(-1)?.id ?? null),
          done,
          checkedCount: variants.length,
          missingCount: issues.filter((issue) => issue.issueType === 'missing')
            .length,
          staleCount: issues.filter((issue) => issue.issueType === 'stale')
            .length,
          extraCount: 0,
          failedCount: issues.filter((issue) => issue.issueType === 'failed')
            .length,
          issues
        }
      }

      if (scanType === 'algolia') {
        try {
          const result = await browseAlgoliaVideoVariantObjectsBatch({
            cursor: input.batchKey,
            batchSize
          })
          const objectIds = result.hits
            .map((hit) => hit.objectID)
            .filter(
              (objectId): objectId is string => typeof objectId === 'string'
            )
          const variants = await prisma.videoVariant.findMany({
            where: { id: { in: objectIds } },
            select: { id: true }
          })
          const existingVariantIds = new Set(
            variants.map((variant) => variant.id)
          )

          for (const hit of result.hits) {
            const objectId =
              typeof hit.objectID === 'string' ? hit.objectID : null
            if (objectId == null || existingVariantIds.has(objectId)) continue

            const languageId =
              typeof hit.languageId === 'string' ? hit.languageId : null
            issues.push({
              id: `extra:${objectId}`,
              issueType: 'extra',
              variantId: null,
              objectId,
              videoId: typeof hit.videoId === 'string' ? hit.videoId : null,
              languageId,
              languageName: getLanguageName(languageId, languages),
              mismatches: [],
              error: null
            })
          }

          return {
            scanType,
            batchKey: input.batchKey ?? null,
            nextBatchKey: result.cursor,
            done: result.cursor == null,
            checkedCount: result.hits.length,
            missingCount: 0,
            staleCount: 0,
            extraCount: issues.length,
            failedCount: 0,
            issues
          }
        } catch (err) {
          const error = getErrorString(err)
          const failedIssues: VariantIndexIssue[] = [
            {
              id: `failed:algolia:${input.batchKey ?? 'start'}`,
              issueType: 'failed',
              variantId: null,
              objectId: input.batchKey ?? 'algolia-browse',
              videoId: null,
              languageId: null,
              languageName: null,
              mismatches: [],
              error
            }
          ]
          return {
            scanType,
            batchKey: input.batchKey ?? null,
            nextBatchKey: null,
            done: true,
            checkedCount: 0,
            missingCount: 0,
            staleCount: 0,
            extraCount: 0,
            failedCount: 1,
            issues: failedIssues
          }
        }
      }

      throw new GraphQLError('scanType must be core or algolia')
    }
  }),
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
  fixAlgoliaVideoVariantIndexIssues: t.withAuth({ isPublisher: true }).field({
    type: FixAlgoliaVideoVariantIndexIssuesResultRef,
    nullable: false,
    args: {
      input: t.arg({
        type: FixAlgoliaVideoVariantIndexIssuesInput,
        required: true
      })
    },
    resolve: async (_parent, { input }) => {
      const client = getAlgoliaClient()
      const algoliaConfig = getAlgoliaConfig()
      const fixed: string[] = []
      const issues: VariantIndexIssue[] = []
      const issueType = input.issueType as VariantIndexIssueType

      if (issueType === 'missing' || issueType === 'stale') {
        for (const objectId of input.objectIds) {
          const variant = await prisma.videoVariant.findUnique({
            where: { id: objectId },
            select: { id: true, videoId: true, languageId: true }
          })

          if (variant == null) {
            issues.push({
              id: `failed:${objectId}`,
              issueType: 'failed',
              variantId: objectId,
              objectId,
              videoId: null,
              languageId: null,
              languageName: null,
              mismatches: [],
              error: 'VideoVariant row no longer exists'
            })
            continue
          }

          const updated = await updateVideoVariantInAlgolia(objectId, logger)
          if (!updated) {
            issues.push({
              id: `failed:${objectId}`,
              issueType: 'failed',
              variantId: objectId,
              objectId,
              videoId: variant.videoId,
              languageId: variant.languageId,
              languageName: null,
              mismatches: [],
              error: 'Algolia update did not complete'
            })
            continue
          }

          fixed.push(objectId)
        }

        return {
          fixedCount: fixed.length,
          failedCount: issues.length,
          issues
        }
      }

      if (issueType === 'extra') {
        for (const objectId of input.objectIds) {
          const variant = await prisma.videoVariant.findUnique({
            where: { id: objectId },
            select: { id: true }
          })

          if (variant != null) {
            issues.push({
              id: `failed:${objectId}`,
              issueType: 'failed',
              variantId: objectId,
              objectId,
              videoId: null,
              languageId: null,
              languageName: null,
              mismatches: [],
              error:
                'VideoVariant row exists; refusing to delete Algolia object'
            })
            continue
          }

          try {
            await client.deleteObject({
              indexName: algoliaConfig.videoVariantsIndex,
              objectID: objectId
            })
            fixed.push(objectId)
          } catch (err) {
            issues.push({
              id: `failed:${objectId}`,
              issueType: 'failed',
              variantId: null,
              objectId,
              videoId: null,
              languageId: null,
              languageName: null,
              mismatches: [],
              error: getErrorString(err)
            })
          }
        }

        return {
          fixedCount: fixed.length,
          failedCount: issues.length,
          issues
        }
      }

      throw new GraphQLError('issueType must be missing, stale, or extra')
    }
  }),
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
