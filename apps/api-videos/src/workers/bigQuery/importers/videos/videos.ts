import { Logger } from 'pino'
import { z } from 'zod'

import { Prisma, VideoLabel } from '.prisma/api-videos-client'

import { prisma } from '../../../../lib/prisma'
import { slugify } from '../../../../lib/slugify'
import { parse, parseMany, processTable } from '../../importer'

const videoSchema = z.object({
  id: z.string(),
  label: z.string().transform<VideoLabel>((value) => {
    switch (value) {
      case 'short':
        return VideoLabel.shortFilm
      case 'feature':
        return VideoLabel.featureFilm
      case 'behind_the_scenes':
        return VideoLabel.behindTheScenes
      case 'segments':
        return VideoLabel.segment
      default:
        return value as VideoLabel
    }
  }),
  primaryLanguageId: z.number().transform(String),
  slug: z.string(),
  childIds: z
    .string()
    .nullable()
    .transform((value) =>
      value == null ? [] : value.substring(1, value.length - 1).split(',')
    )
    .transform((value) => value.filter((id) => id.length > 0)),
  image: z.string().nullable()
})

type Video = z.infer<typeof videoSchema>

let videoIds: string[] = []

export function pushVideoId(...videos: Array<{ id: string }>): void {
  videoIds.push(...videos.map(({ id }) => id))
}

export function setVideoIds(videos: Array<{ id: string }>): void {
  videoIds = []
  pushVideoId(...videos)
}

export function getVideoIds(): string[] {
  return videoIds
}

let videoSlugs: Record<string, string> = {}

export function pushVideoSlug(
  ...videos: Array<{ id: string; slug: string | null }>
): void {
  videos.forEach(({ id, slug }) => {
    if (slug != null) videoSlugs[slug] = id
  })
}
export function setVideoSlugs(
  videos: Array<{ id: string; slug: string | null }>
): void {
  videoSlugs = {}
  pushVideoSlug(...videos)
}

export function getVideoSlugs(): Record<string, string> {
  return videoSlugs
}

export async function importVideos(logger?: Logger): Promise<() => void> {
  const videos = await prisma.video.findMany({
    select: { id: true, slug: true }
  })
  setVideoIds(videos)
  setVideoSlugs(videos)

  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videos_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )

  return () => {
    setVideoIds([])
    setVideoSlugs([])
  }
}

function transform(
  video: Video
): Prisma.VideoCreateInput & { id: string; slug: string } {
  return {
    ...video,
    slug: slugify(video.id, video.slug, videoSlugs),
    noIndex: false
  }
}

export async function importOne(row: unknown): Promise<void> {
  const video = parse(videoSchema, row)
  const input = transform(video)
  await prisma.video.upsert({
    where: { id: video.id },
    update: input,
    create: input
  })
  pushVideoId(video)
  pushVideoSlug(video)
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videos, inValidRowIds } = parseMany(videoSchema, rows)

  if (videos.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const transformedVideos = videos
    .map((input) => transform(input))
    .filter(({ id }) => !getVideoIds().includes(id))

  await prisma.video.createMany({
    data: transformedVideos,
    skipDuplicates: true
  })

  pushVideoId(...transformedVideos)
  pushVideoSlug(...transformedVideos)
}
