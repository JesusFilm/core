import compact from 'lodash/compact'
import uniq from 'lodash/uniq'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
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
      id: transformedVideoVariant.edition
    },
    update: {},
    create: {
      id: transformedVideoVariant.edition
    }
  })

  await prisma.videoVariant.upsert({
    where: {
      id: videoVariant.id
    },
    update: transformedVideoVariant,
    create: transformedVideoVariant
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

  const editions = uniq(transformedVideoVariants.map(({ edition }) => edition))
  for (const edition of editions) {
    await prisma.videoEdition.upsert({
      where: {
        id: edition
      },
      update: {},
      create: {
        id: edition
      }
    })
  }

  await prisma.videoVariant.createMany({
    data: transformedVideoVariants,
    skipDuplicates: true
  })
}
