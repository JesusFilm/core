import { Logger } from 'pino'
import { z } from 'zod'

import { parse, parseMany, processTable } from '../../importer'

const s3Schema = z.object({
  videoVariantId: z.string(),
  s3Url: z.string()
})

type S3Video = z.infer<typeof s3Schema>

export async function importS3Videos(logger: Logger): Promise<void> {
  await processTable(
    'jfp-data-warehouse.jfp_mmdb_prod.core_video_arclight_data',
    importOne,
    importMany,
    true,
    logger
  )
}

export async function importOne(row: unknown): Promise<void> {
  const video = parse(s3Schema, row)
  await prisma.video.upsert({
    where: { id: video.id },
    update: input,
    create: input
  })
}
