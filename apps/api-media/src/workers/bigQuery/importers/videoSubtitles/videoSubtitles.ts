import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoSubtitleSchema = z
  .object({
    video: z.string(),
    edition: z
      .string()
      .nullable()
      .transform((value) => value ?? 'base'),
    vttSrc: z.string().nullable(),
    srtSrc: z.string().nullable(),
    languageId: z.number().transform(String)
  })
  .transform((data) => ({
    ...omit(data, 'video', 'primary'),
    videoId: data.video,
    primary: data.languageId === '529'
  }))

export async function importVideoSubtitles(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoSubtitle = parse(videoSubtitleSchema, row)
  if (!getVideoIds().includes(videoSubtitle.videoId))
    throw new Error(`Video with id ${videoSubtitle.videoId} not found`)

  await prisma.videoSubtitle.upsert({
    where: {
      videoId_edition_languageId: {
        videoId: videoSubtitle.videoId,
        edition: videoSubtitle.edition,
        languageId: videoSubtitle.languageId
      }
    },
    update: videoSubtitle,
    create: videoSubtitle
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoSubtitles, inValidRowIds } = parseMany(
    videoSubtitleSchema,
    rows
  )

  if (videoSubtitles.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoSubtitle.createMany({
    data: videoSubtitles.filter(({ videoId }) =>
      getVideoIds().includes(videoId)
    ),
    skipDuplicates: true
  })
}
