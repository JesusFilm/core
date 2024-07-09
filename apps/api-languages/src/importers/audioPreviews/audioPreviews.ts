import { z } from 'zod'
import get from 'lodash/get'
import { prisma } from '../../lib/prisma'
import { getCurrentTimeStamp, getRowsFromTable } from '../bigquery'

const audioPreviewSchema = z.object({
  languageId: z.number().transform(String),
  duration: z.number(),
  size: z.number(),
  value: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
})

type AudioPreview = z.infer<typeof audioPreviewSchema>

export async function importAudioPreview(
  existingLanguageIds: string[]
): Promise<void> {
  const bigQueryTableName = ''
  const importTime = await prisma.importTimes.findUnique({
    where: { modelName: bigQueryTableName }
  })
  const updateTime = await getCurrentTimeStamp()
  for await (const row of getRowsFromTable(
    bigQueryTableName,
    importTime?.lastImport,
    true
  )) {
    try {
      const parser = audioPreviewSchema.safeParse(row)
      if (!parser.success) {
        throw new Error(
          `row does not match schema: ${
            get(row, 'id') ?? 'unknownId'
          }\n${JSON.stringify(row, null, 2)}`
        )
      }
      if (!existingLanguageIds.includes(parser.data.languageId))
        throw new Error(`Language with id ${parser.data.languageId} not found`)
      await prisma.audioPreview.upsert({
        where: {
          languageId: parser.data.languageId
        },
        update: parser.data,
        create: parser.data
      })
    } catch (error) {
      errors.push({
        bigQueryTableName,
        id: get(row, 'id') ?? get(row, 'videoId'),
        message: error.message
      })
    }
  }
  await prisma.importTimes.upsert({
    where: { modelName: bigQueryTableName },
    create: {
      modelName: bigQueryTableName,
      lastImport: updateTime
    },
    update: { lastImport: updateTime }
  })
}
