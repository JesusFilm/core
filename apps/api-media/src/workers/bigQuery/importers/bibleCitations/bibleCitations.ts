import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getBibleBookIds } from '../bibleBooks'
import { getVideoIds } from '../videos'

const bibleCitationSchema = z
  .object({
    videoId: z.string(),
    osisId: z.string(),
    bibleBookId: z.number().transform(String),
    position: z.number(),
    chapterStart: z.number(),
    chapterEnd: z.number().nullable(),
    verseStart: z
      .number()
      .nullable()
      .transform((value) => value ?? 1),
    verseEnd: z.number().nullable(),
    datastream_metadata: z.object({
      uuid: z.string()
    })
  })
  .transform((data) => ({
    ...omit(data, ['position', 'datastream_metadata']),
    id: data.datastream_metadata.uuid,
    order: data.position
  }))

export async function importBibleCitations(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoBibleCitation_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const bibleCitation = parse(bibleCitationSchema, row)
  if (!getVideoIds().includes(bibleCitation.videoId)) {
    throw new Error(`Video with id ${bibleCitation.videoId} not found`)
  }
  if (!getBibleBookIds().includes(bibleCitation.bibleBookId))
    throw new Error(`BibleBook with id ${bibleCitation.bibleBookId} not found`)

  await prisma.bibleCitation.upsert({
    where: { id: bibleCitation.id },
    update: bibleCitation,
    create: bibleCitation
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: bibleCitations, inValidRowIds } = parseMany(
    bibleCitationSchema,
    rows
  )

  if (bibleCitations.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.bibleCitation.createMany({
    data: bibleCitations.filter(
      ({ videoId, bibleBookId }) =>
        getVideoIds().includes(videoId) &&
        getBibleBookIds().includes(bibleBookId)
    ),
    skipDuplicates: true
  })
}
