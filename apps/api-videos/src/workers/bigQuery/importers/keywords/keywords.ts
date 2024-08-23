import omit from 'lodash/omit'
import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../importer'
import { getVideoIds } from '../videos'

const keywordSchema = z
  .object({
    value: z.string(),
    languageId: z.number(),
    videoIds: z.string().optional(),
    datastream_metadata: z.object({
      uuid: z.string()
    })
  })
  .transform((data) => ({
    ...omit(data, ['videoIds', 'datastream_metadata']),
    id: data.datastream_metadata.uuid,
    languageId: data.languageId.toString(),
    videos:
      data.videoIds != null
        ? { connect: data.videoIds.split(',').map((id) => ({ id })) }
        : undefined
  }))

type Keyword = z.infer<typeof keywordSchema>

function filterValidVideos(keyword: Keyword): Keyword {
  if (keyword.videos?.connect != null) {
    const validVideoIds = getVideoIds()
    keyword.videos.connect = keyword.videos.connect.filter((v) =>
      validVideoIds.some((id) => id === v.id)
    )
  }
  return keyword
}

export async function importKeywords(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_keywords_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const keyword = parse(keywordSchema, row)
  const filteredKeyword = filterValidVideos(keyword)
  await prisma.keyword.upsert({
    where: {
      value_languageId: {
        value: filteredKeyword.value,
        languageId: filteredKeyword.languageId
      }
    },
    update: filteredKeyword,
    create: filteredKeyword
  })
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: keywords, inValidRowIds } = parseMany(keywordSchema, rows)

  if (keywords.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  const filteredKeywords = keywords.map((keyword) => filterValidVideos(keyword))

  await prisma.keyword.createMany({
    data: filteredKeywords.map((keyword) => ({
      id: keyword.id,
      value: keyword.value,
      languageId: keyword.languageId
    })),
    skipDuplicates: true
  })

  for (const keyword of filteredKeywords) {
    if (keyword.videos?.connect != null && keyword.videos.connect.length > 0) {
      await prisma.keyword.update({
        where: { id: keyword.id },
        data: {
          videos: {
            connect: keyword.videos.connect
          }
        }
      })
    }
  }
}
