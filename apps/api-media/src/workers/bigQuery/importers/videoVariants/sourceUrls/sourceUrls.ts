import { Logger } from 'pino'
import { z } from 'zod'

import { prisma } from '../../../../../lib/prisma'
import { parse, parseMany, processTable } from '../../../importer'

const sourceUrlSchema = z.object({
  videoVariantId: z.string(),
  masterUri: z.string().nullable(),
  updatedAt: z.object({ value: z.string() }).transform((value) => value.value)
})

export async function importSourceUrls(logger?: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantMaster_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const { masterUri: sourceUrl, videoVariantId: id } = parse(
    sourceUrlSchema,
    row
  )

  try {
    await prisma.videoVariant.update({
      where: {
        id
      },
      data: {
        sourceUrl
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to update video variant ${id}: ${message}`)
  }
}

export async function importMany(rows: unknown[]): Promise<void> {
  const { data: sourceUrls, inValidRowIds } = parseMany(sourceUrlSchema, rows)

  if (sourceUrls.length !== rows.length)
    throw new Error(`some rows do not match schema: ${inValidRowIds.join(',')}`)

  // Using Promise.all with update since Prisma doesn't support updateMany with different values
  await Promise.all(
    sourceUrls.map(async (sourceUrl) => {
      try {
        await prisma.videoVariant.update({
          where: {
            id: sourceUrl.videoVariantId
          },
          data: {
            sourceUrl: sourceUrl.masterUri
          }
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(
          `Failed to update video variant ${sourceUrl.videoVariantId}: ${message}`
        )
      }
    })
  )
}
