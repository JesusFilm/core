import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const videoStudyQuestionSchema = z
  .object({
    value: z.string(),
    videoId: z.string(),
    languageId: z.number().transform(String),
    primary: z.number().transform(Boolean),
    order: z.number(),
    crowdinId: z.string().nullish()
  })
  .transform((o) => ({
    ...omit(o, 'crowdinId'),
    crowdInId: o.crowdinId
  }))

export async function importVideoStudyQuestions(
  logger?: Logger
): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoStudyQuestions_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const videoStudyQuestion = parse(videoStudyQuestionSchema, row)
  if (!getVideoIds().includes(videoStudyQuestion.videoId))
    throw new Error(`Video with id ${videoStudyQuestion.videoId} not found`)

  await prisma.videoStudyQuestion.upsert({
    where: {
      videoId_languageId_order: {
        videoId: videoStudyQuestion.videoId,
        languageId: videoStudyQuestion.languageId,
        order: videoStudyQuestion.order
      }
    },
    update: videoStudyQuestion,
    create: videoStudyQuestion
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: videoStudyQuestions, inValidRowIds } = parseMany(
    videoStudyQuestionSchema,
    rows
  )

  if (videoStudyQuestions.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  await prisma.videoStudyQuestion.createMany({
    data: videoStudyQuestions.filter(({ videoId }) =>
      getVideoIds().includes(videoId)
    ),
    skipDuplicates: true
  })
}
