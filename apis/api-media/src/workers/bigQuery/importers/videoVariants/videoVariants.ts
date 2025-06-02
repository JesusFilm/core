import compact from 'lodash/compact'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '@core/prisma-media/client'

import { parse, parseMany, processTable } from '../../importer'
import { getLanguageSlugs } from '../languageSlugs'
import { getVideoIds, getVideoSlugs } from '../videos'

const videoVariantSchema = z.object({
  id: z.string(),
  hls: z.string().nullable(),
  dash: z.string().nullable(),
  share: z.string().nullable(),
  duration: z
    .custom()
    .transform(String)
    .transform<number>((value: string) => Math.round(Number(value))),
  lengthInMilliseconds: z.number().nullable(),
  languageId: z.number().transform(String),
  videoId: z.string(),
  slug: z.string(),
  languageName: z.string().nullable(),
  edition: z
    .string()
    .nullable()
    .transform((value) => value ?? 'base')
})

type VideoVariant = z.infer<typeof videoVariantSchema>

let videoVariantIds: string[] = []

export function setVideoVariantIds(videoVariants: Array<{ id: string }>): void {
  videoVariantIds = videoVariants.map(({ id }) => id)
}

export function getVideoVariantIds(): string[] {
  return videoVariantIds
}

export async function importVideoVariants(
  logger?: Logger
): Promise<() => void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariant_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )

  setVideoVariantIds(
    await prisma.videoVariant.findMany({ select: { id: true } })
  )

  return () => setVideoVariantIds([])
}

function transform(
  videoVariant: VideoVariant,
  videoSlugs: { [id: string]: string }
): Omit<VideoVariant, 'languageName'> | null {
  if (
    videoSlugs[videoVariant.videoId] == null ||
    videoVariant.languageName == null
  )
    return null

  const languageSlug = getLanguageSlugs()[videoVariant.languageId]

  const videoSlug = videoSlugs[videoVariant.videoId]

  if (languageSlug == null || videoSlug == null) return null

  return {
    id: videoVariant.id,
    hls: videoVariant.hls,
    dash: videoVariant.dash,
    share: videoVariant.share,
    duration: videoVariant.duration,
    lengthInMilliseconds: videoVariant.lengthInMilliseconds,
    languageId: videoVariant.languageId,
    videoId: videoVariant.videoId,
    edition: videoVariant.edition,
    slug: `${videoSlug}/${languageSlug}`
  }
}

function invertedVideoSlugs(): { [id: string]: string } {
  return Object.fromEntries(
    Object.entries(getVideoSlugs()).map((a) => a.reverse())
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoVariant = parse(videoVariantSchema, row)

  if (!getVideoIds().includes(videoVariant.videoId))
    throw new Error(`Video with id ${videoVariant.videoId} not found`)

  const transformedVideoVariant = transform(videoVariant, invertedVideoSlugs())
  if (transformedVideoVariant == null) return

  await prisma.videoEdition.upsert({
    where: {
      name_videoId: {
        videoId: transformedVideoVariant.videoId,
        name: transformedVideoVariant.edition
      }
    },
    update: {},
    create: {
      videoId: transformedVideoVariant.videoId,
      name: transformedVideoVariant.edition
    }
  })

  await prisma.videoVariant.upsert({
    where: {
      id: videoVariant.id
    },
    update: transformedVideoVariant,
    create: transformedVideoVariant
  })

  const video = await prisma.video.findUnique({
    where: { id: transformedVideoVariant.videoId },
    select: { availableLanguages: true }
  })

  const currentLanguages = video?.availableLanguages || []
  const updatedLanguages = Array.from(
    new Set([...currentLanguages, transformedVideoVariant.languageId])
  )

  await prisma.video.update({
    where: { id: transformedVideoVariant.videoId },
    data: { availableLanguages: updatedLanguages }
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoVariants, inValidRowIds } = parseMany(
    videoVariantSchema,
    rows
  )

  if (videoVariants.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const videoSlugs = invertedVideoSlugs()
  const transformedVideoVariants = compact(
    videoVariants.map((videoVariant) => transform(videoVariant, videoSlugs))
  )

  // Prepare all database operations
  const videoEditionUpserts = transformedVideoVariants.map((variant) => ({
    where: {
      name_videoId: {
        videoId: variant.videoId,
        name: variant.edition
      }
    },
    create: {
      videoId: variant.videoId,
      name: variant.edition
    },
    update: {}
  }))

  // Prepare video language updates
  const videoLanguageUpdates = new Map<string, Set<string>>()
  transformedVideoVariants.forEach((variant) => {
    const languages = videoLanguageUpdates.get(variant.videoId) || new Set()
    languages.add(variant.languageId)
    videoLanguageUpdates.set(variant.videoId, languages)
  })

  // Execute all operations in a single transaction
  await prisma.$transaction(
    async (tx) => {
      await Promise.all(
        videoEditionUpserts.map(({ where, create, update }) =>
          tx.videoEdition.upsert({
            where,
            create,
            update
          })
        )
      )

      await tx.videoVariant.createMany({
        data: transformedVideoVariants,
        skipDuplicates: true
      })

      const existingVideos = await tx.video.findMany({
        where: {
          id: {
            in: Array.from(videoLanguageUpdates.keys())
          }
        },
        select: {
          id: true,
          availableLanguages: true
        }
      })

      const videoUpdates = existingVideos.map((video) => {
        const newLanguages = videoLanguageUpdates.get(video.id)
        if (!newLanguages) return null

        const currentLanguages = video.availableLanguages || []
        const updatedLanguages = Array.from(
          new Set([...currentLanguages, ...newLanguages])
        )

        return tx.video.update({
          where: { id: video.id },
          data: { availableLanguages: updatedLanguages }
        })
      })

      await Promise.all(compact(videoUpdates))
    },
    {
      timeout: 30000
    }
  )
}
